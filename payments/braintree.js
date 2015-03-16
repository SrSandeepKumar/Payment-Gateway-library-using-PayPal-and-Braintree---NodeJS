(function(){

	var braintreePay = require('braintree');

	var gateway = braintreePay.connect({
		environment: braintreePay.Environment.Sandbox,
		merchantId: "3h4ng5qpn2j8jp7q",
		publicKey: "6wyvs7mmdytd9m6n",
		privateKey: "5ca28de9963ecef3da002429073e43f9",
	});

	module.exports.braintree = function(request, response){
		
		console.log("comming from the exports of braintree");
		console.log(request.query);

		var data = request.query;

		var saleRequest = {
			amount: data.price,
			creditCard: {
				number: data.number,
				cvv: data.cvv2,
				expirationDate: data.expire_month+"/"+data.expire_year.slice(2),
			},
			options: {
				submitForSettlement: true
			}
			
		};

		gateway.transaction.sale(saleRequest, function(error, result){
			console.log("simply");

			if(error){
				console.log(error.name);
				throw error;
			}

			if(result.success){
				response.send(result.transaction.id);
			} else {
				response.send(result.message);
			}
		});
		
	};

})();