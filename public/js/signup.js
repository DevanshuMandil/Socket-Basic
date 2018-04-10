$("document").ready(function(){
	$("#signup").click(function(){
		var body= {
			username: $("#username").val(),
			email: $("#email").val(),
			phone_no: $("#phone_no").val(),
			password: $("#password").val()
		};

		fetch('http://localhost:3000/user', {
						    method: 'POST',
						    body: JSON.stringify(body),
						    headers: {'Content-Type': 'application/json'}
							}).then(res => {
							return res.json()
							}).then((response) => {
								alert("you have Signed Up succesfully!!!")
							});
				});
});