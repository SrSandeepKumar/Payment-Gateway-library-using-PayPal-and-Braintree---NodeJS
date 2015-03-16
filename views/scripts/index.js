(function(){
	$(document).ready(function(){
		$(".currencySelector li>a").on('click', function(data){
			$(".currencyDropDown").text(this.innerHTML);
		});

		$(window).keydown(function(event){
		    if(event.keyCode == 13) {
		      event.preventDefault();
		      return false;
		    }
		});

		var checkAlpha = function(event){
			if((event.keyCode >= 65 && event.keyCode <= 90) || event.keyCode == 188 || event.keyCode == 190 || event.keyCode == 191 || event.keyCode == 192 || event.keyCode == 219 || event.keyCode == 220 || event.keyCode == 221 || event.keyCode == 222 || event.keyCode == 186|| event.keyCode == 187 || event.keyCode == 189 || event.keyCode == 107 || event.keyCode == 109 || event.keyCode == 106 || event.keyCode == 46 || event.keyCode == 111) {
			    event.preventDefault();
			    return false;
		    }
		};

		var checkNumber = function(event){
			if((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 96 && event.keyCode <= 105)) {
			    event.preventDefault();
			    return false;
		    }
		};

		var removeInvalidClass = function(){
			$(this).removeClass("invalid");
			$(this).popover('destroy');
			$("#myAlert").alert('close');
		};

		$(".cvv").keydown(checkAlpha);
		$(".expiryInfo").keydown(checkAlpha);
		$(".price").keydown(checkAlpha);
		$(".cardNumber").keydown(checkAlpha);
		$(".cardHolderName").keydown(checkNumber);
		$(".fullName").keydown(checkNumber);

		$(".fullName").focus(removeInvalidClass);
		$(".cardNumber").focus(removeInvalidClass);
		$(".expiryYear").focus(removeInvalidClass);
		$(".expiryMonth").focus(removeInvalidClass);
		$(".cvv").focus(removeInvalidClass);
		$(".cardHolderName").focus(removeInvalidClass);
		$(".price").focus(removeInvalidClass);
		$(".fullName").focus(removeInvalidClass);
		$(".currencyDropDown").focus(removeInvalidClass);

		$(".clear").on('click', function(){
			$("input").removeClass("invalid");
			$("button").removeClass("invalid");
			$("input").val('');
			$(".currencyDropDown").text("currency");
			$("input").popover('destroy');
			$("button").popover('destroy');
			$("#myAlert").alert('close');
		});


		$(".submit").click(function(){
			var holderName, cardNumber, cvv, price, expiryMonth, expiryYear, fullName, cardType, currency, error=false;
			var visa = /^4[0-9]{12}(?:[0-9]{3})?$/;
		    var mastercard = /^5[1-5][0-9]{14}$/;
		    var amex = /^3[47][0-9]{13}$/;
		    var discover = /^6(?:011|5[0-9]{2})[0-9]{12}$/;
		    var cvv = /^[0-9]{3,4}/;

			fullName = $(".fullName").val();
			holderName = $(".cardHolderName").val();
			cardNumber = $(".cardNumber").val();
			cvv = parseFloat($(".cvv").val());
			price = parseInt($(".price").val());
			expiryMonth = parseInt($(".expiryMonth").val());
			expiryYear = parseInt($(".expiryYear").val());
			currency = $(".currencyDropDown").text();

			if(cardNumber.match(amex)){
				cardType = "amex";
			} else if(cardNumber.match(visa)){
				cardType = "visa";
			} else if(cardNumber.match(mastercard)){
				cardType = "mastercard";
			} else if(cardNumber.match(discover)){
				cardType = "discover";
			} else {
				cardType = "invalid";
			}

			if(cardType === "invalid"){
				error = true;
				$(".cardNumber").addClass("invalid");
				$(".cardNumber").popover({
					container: 'body',
					trigger: 'focus',
					content : "please check the Card Number"
				});
				$(".cardNumber").popover('show');
			}

			if(expiryYear <= 14 || isNaN(expiryYear)){
				error = true;
				$(".expiryYear").addClass("invalid");
				$(".expiryYear").popover({
					container: 'body',
					trigger: 'focus',
					content : "please check the Year"
				});
				$(".expiryYear").popover('show');
			}

			if(expiryMonth === 0 || expiryMonth >= 13 || isNaN(expiryMonth)){
				error = true;
				$(".expiryMonth").addClass("invalid");
				$(".expiryMonth").popover({
					container: 'body',
					trigger: 'focus',
					placement: 'left',
					content : "please check the Month"
				});
				$(".expiryMonth").popover('show');
			}

			if(isNaN(cvv)){
				error = true;
				$(".cvv").addClass("invalid");
			}

			if(isNaN(price)){
				error = true;
				$(".price").addClass("invalid");
				$(".price").popover({
					container: 'body',
					trigger: 'focus',
					placement: 'left',
					content : "please enter the amount"
				});
				$(".price").popover('show');
			}

			if(holderName === ""){
				error = true;
				$(".cardHolderName").addClass("invalid");
			}

			if(fullName === ""){
				error = true;
				$(".fullName").addClass("invalid");
			}

			if(currency.length > 4){
				error = true;
				$(".currencyDropDown").addClass("invalid");
				$(".currencyDropDown").popover({
					container: 'body',
					trigger: 'focus',
					placement: 'right',
					content : "please check the Currency"
				});
				$(".currencyDropDown").popover('show');
			}

			if(!error){
				// Do success ops

				var card_data = {
					type: cardType,
					number: cardNumber,
					expire_month: expiryMonth,
					expire_year: expiryYear,
					cvv2: cvv,
					name: holderName,
					price : price, 
					currency : currency
				};
				
				var transaction_data = {
					Price : price, 
					Currency : currency,
					CustomerFullname : fullName
				};

				var paymentPath;

				if(cardType == "amex"){
					paymentPath = "payment_paypal";
					if(currency == "USD"){
						//use paypal
						paymentPath = "payment_paypal";
					} else {
						// return an error message - AMEX is possible to use only for USD
					}
				} else if(currency === "USD" || currency === "EUR" || currency === "AUD"){
					//use paypal
					paymentPath = "payment_paypal";
				} else {
					//use braintree
					paymentPath = "payment_braintree";
				}

				$.ajax({
					method: "GET",
					url: "http://localhost:3000/"+paymentPath,
					data: card_data
				}).done(function(message){
					console.log(message);
					$("body").prepend("<div id='myAlert' class='alert alert-success'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button><strong>Success : </strong>"+ message +"</div>");
				}).fail(function(data, message){
					console.log(message);
					$("body").prepend("<div id='myAlert' class='alert alert-danger'><p class='close closeAlert'>&times;</p><strong>Success : </strong>"+ message +"</div>");
				});
			} else {
				// Do nothing
			}

		});
		
	});
})();