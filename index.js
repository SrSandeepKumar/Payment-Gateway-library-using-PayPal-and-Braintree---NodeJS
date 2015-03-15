(function(){
	var express = require("express"),
		app = express(),
		ejs = require("ejs"),
		payments_paypal = require("./payments/paypal"),
		payments_braintree = require("./payments/braintree");

	app.set("view engine", "ejs");
	app.use(express.static(__dirname + "/views"));

	app.get("/", function(request, response){
		response.render("index");
	});

	app.get("/payment_paypal", payments_paypal.paypal);
	app.get("/payment_braintree", payments_braintree.braintree);

	var server =  app.listen(3000, function(){
		console.log("Please go to http://localhost:3000");
	});
})();