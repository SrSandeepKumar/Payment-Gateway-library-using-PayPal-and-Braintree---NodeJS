(function(){

	var paypalPay = require('paypal-rest-sdk'),
		MongoClient = require('mongodb').MongoClient,
		assert = require('assert');

		//Connection URL
		var url = "mongodb://localhost:27017/HotelQuickly";

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
				response.status(500).send("Payment unable to process.");
			}

			if(result){
				console.log("Payment resulted successfully.");
				var insertDocuments = function(db, callback){
					var collection = db.collection('documents');
					var transactionData = {"paymentPortal": "paypal", "card_data": data, "transactionInfo": result};
					collection.insert(transactionData, function(error, result){
						assert.equal(error, null);
						console.log("Transaction information stored successfully.");
						callback(result);
					});
				};

				//Use connect method to connect to the server
				MongoClient.connect(url, function(error, db){
					assert.equal(null, error);
					console.log("connected to DB successfully.");

					insertDocuments(db, function(){
				        db.close();
					});
				});
				response.status(200).send("The payment was successfull, transaction id: " + result.id);
			}

		});
	};

})();