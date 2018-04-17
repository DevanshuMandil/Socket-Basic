$("document").ready(function(){
	$("#login").click(function(){

			var body = {
				email: $("#email").val(),
				password: $("#password").val()
			}

			//alert(JSON.stringify(body));


				$.ajax({
						    url: 'http://localhost:3000/user/login',
						    headers: {
						        'Content-Type':'application/json'
						    },
						    method: 'POST',
						    dataType: 'json',
						    data: JSON.stringify(body),
						    success: function(data,status,request){
						    	//console.log("Body: "+ JSON.stringify(data));
						    	//console.log('Headers: '+request.getResponseHeader('Auth'));
						    	sessionStorage.setItem("token",request.getResponseHeader('Auth'));
						    	sessionStorage.setItem("username",data.username);
						    	sessionStorage.setItem("email",data.email);
						    	sessionStorage.setItem("id",Math.random());
						    	var page_url="/joinroom.html";
								$(location).attr('href',page_url);

						    }
  						});

	});
});