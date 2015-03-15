(function(){

	var paymentCompletionMessage;

	var paypalPay = require('paypal-rest-sdk');

	var configDetails = {
		"host": "api.sandbox.paypal.com",
		"port": "",
		"client_id": "Adodgu3-IccIPCFMGkcsdviABcMbwyiF7N8HvZQAOdU7XvU3ewKlJZJlECu8nyDcwjydxEQSQtmYSN5I",
	    "client_secret": "EHbmZx6XB-BsNl6Tt-Y0K_e7PGiAvjRZlk-llsIS0wGmCqLSfC7QHKmpt6XNfpI9taV4avoNTfnAY7lV"
	}

	module.exports.paypal = function(request, response){

		var data = request.query;

		var create_payment_json = {
			"intent": "sale",
			"payer": {
				"payment_method": "credit_card",
				"funding_instruments": [{
					"credit_card":{
						"type" : data.type,
						"number": data.number,
						"expire_month": data.expire_month,
						"expire_year": data.expire_year,
						"cvv2": data.cvv2,
						"first_name": data.name,
					}
				}]
			},
			"transactions":[{
				"amount":{
					"total": data.price,
					"currency": data.currency
				}
			}]
		};

		paypalPay.payment.create(create_payment_json, configDetails, function(error, result){
			
			if(error){
				console.log(error);
				throw error;
			}

			if(result){
				console.log("create payment response");
				response.status(200).send(JSON.stringify(result));
			}

		});
	};

})();