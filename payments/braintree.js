(function(){

	var braintreePay = require('braintree'),
		MongoClient = require('mongodb').MongoClient,
		assert = require('assert');

		//Connection URL
		var url = "mongodb://localhost:27017/HotelQuickly";

	var gateway = braintreePay.connect({
		environment: braintreePay.Environment.Sandbox,
		merchantId: "3h4ng5qpn2j8jp7q",
		publicKey: "6wyvs7mmdytd9m6n",
		privateKey: "5ca28de9963ecef3da002429073e43f9",
	});

	module.exports.braintree = function(request, response){
		
		console.log("Reached braintree portal");

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
			
			if(error){
				console.log(error.name);
				response.status(404).send(error.name);
			}

			if(result.success){
			
				var insertDocuments = function(db, callback){
					var collection = db.collection('documents');
					var transactionData = {"paymentPortal": "braintree", "card_data": data, "transactionInfo": result.transaction};
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

				response.status(200).send("The payment was successfull, transaction id: " + result.transaction.id);
				
			} else {
				response.status(404).send(result.message);
			}
		});
		
	};

})();