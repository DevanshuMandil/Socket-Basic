$("document").ready(function(){

	//alert(sessionStorage.getItem("token"));
				$.ajax({
						    url: 'http://localhost:3000/joinrooms',
						    headers: {
						        'Content-Type':'application/json',
						        'Auth': sessionStorage.getItem("token")
						    },
						    method: 'get',
						    dataType: 'json',
						    success: function(data,status,request){
						    		alert("Authenticated");
						    		alert(data);
						    		},

						    error: function(e)
								    {
								    	alert("Something went wrong!!!!");	
								    }
  						});

 
});