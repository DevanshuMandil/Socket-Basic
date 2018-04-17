var name = getQueryVariable('name') || 'Anonymous';
var room = getQueryVariable('room');
var socket = io();
var id = sessionStorage.getItem("id");

//upgrade h1 tag
jQuery('.room-tittle').text(room);

console.log(name + ' wants to join '+ room);

socket.on('connect',function(){
	console.log('Connected to socket.io server!');
	socket.emit('joinRoom', {
		name: name,
		room: room,
	});
});

socket.on('message',function(message){
	var momentTimestamp = moment.utc(message.timestamp);
	var $messages = jQuery('.chat');

	if(message.id !== id)
	{
		var $message = jQuery('<li class="left clearfix"></li>');
		$message.append('<span class="chat-img pull-left"><img src="http://placehold.it/50/55C1E7/fff&text=U" alt="User Avatar" class="img-circle"/></span');
		$message.append('<div class="chat-body clearfix"> <div class="header"><strong class="primary-font">'+message.name+'</strong><small class="pull-right text-muted"><span class="glyphicon glyphicon-time"></span>'+momentTimestamp.local().format('h:mm a')+'</small></div><p>'+message.text+'</p></div>');
		$messages.append($message);
	}
	else
	{
		var $message = jQuery('<li class="right clearfix"></li>');
		$message.append('<span class="chat-img pull-right"><img src="http://placehold.it/50/55C1E7/fff&text=U" alt="User Avatar" class="img-circle"/></span');
		$message.append('<div class="chat-body clearfix"> <div class="header"><strong class="pull-right primary-font">'+message.name+'</strong><small class="text-muted"><span class="glyphicon glyphicon-time"></span>'+momentTimestamp.local().format('h:mm a')+'</small></div><p class="pull-right">'+message.text+'</p></div>');
		$messages.append($message);	
	}
	//jQuery('.messages').append('<p><strong>' + momentTimestamp.local().format('h:mm a') +':  </strong>' + message.text + '</p>');
});

//Handles submitting of new message
var $form = jQuery('#message-form');

$form.on('submit',function(event){
		event.preventDefault();

		$message = $form.find('input[name=message]'); 
		socket.emit('message',{
			name: name, 
			text: $message.val(),
			id: sessionStorage.getItem("id")
		});

		$message.val('');
});
