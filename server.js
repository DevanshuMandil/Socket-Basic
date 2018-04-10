var PORT = process.env.PORT || 3000;
var express = require('express');
var moment = require('moment');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js')
var middleware = require('./middleware.js')(db);

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(bodyParser.json());

app.use(express.static(__dirname+'/public'));

var clientInfo = {};

// Sends current users to provided socket
function sendCurrentUsers(socket)
{ 
	var info = clientInfo[socket.id];
	var users = [];

	if(typeof info === 'undefined')
	{
		return;
	}

	Object.keys(clientInfo).forEach(function(socketId){
		var userInfo = clientInfo[socketId];

		if(info.room === userInfo.room)
		{
			users.push(userInfo.name);
		}
	});

	socket.emit('message',{
		name: 'System',
		text: 'Current users: ' + users.join(', '),
		timestamp: moment().valueOf()
	});
}

//GET ALL JOIN ROOMS

function getJoinRooms()
{
	var rooms=[];
	Object.keys(clientInfo).forEach(function(socketId){
		 var userInfo = clientInfo[socketId];
		 rooms.push(userInfo.room);
		//console.log(userInfo.room);
	});
	return rooms;
}

io.on('connection',function(socket){
	console.log('User connected via socket.io');

	socket.on('disconnect',function(){
		var userData = clientInfo[socket.id];

		if(typeof userData !== 'undefined')
		{
			socket.leave(userData.room);
			io.to(userData.room).emit('message',{
				name: 'System',
				text: userData.name + ' has left!!',
				timestamp: moment.valueOf()
			});
			delete clientInfo[socket.id];
		}
	});



	socket.on('joinRoom', function(req){

		clientInfo[socket.id] = req;
		socket.join(req.room);
		socket.broadcast.to(req.room).emit('message',{
			name: 'System',
			text: req.name + ' has joined!!',
			timestamp: moment().valueOf()
		});

	});

	socket.on('message',function(message){
		console.log('Message received: '+ message.text);

		if(message.text === '@currentUsers')
		{
			sendCurrentUsers(socket);
		}
		else
		{
			message.timestamp = moment().valueOf();
			io.to(clientInfo[socket.id].room).emit('message',message);
		}
	});

	socket.emit('message',{
		name: 'System',
		text: 'Welcome to the chat application!',
		timestamp  : moment().valueOf()
	});
});


// POST /user
app.post('/user',function(req,res){
	var body = _.pick(req.body,'username','email','phone_no','password');

	db.user.create({
		username: body.username,
		email: body.email,
		phone_no: body.phone_no,
		password: body.password
	}).then(function(user){
		res.status(200).json(user.toPublicJSON());
	}).catch(function(e){
		res.status(400).json(e);
	});
});


// POST /user/login
app.post('/user/login',function(req,res){
	var body = _.pick(req.body, 'email', 'password');
	var userInstance;

	db.user.authenticate(body).then(function(user) {

		var token = user.generateToken('authentication');
		userInstance = user;

		return db.token.create({
			token: token
		});
		//res.status(200).json(user.toPublicJSON());
	}).then(function(tokenInstance) {

		res.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
	}).catch(function() {
		res.status(401).send();
	});
});


// GET /joinrooms
app.get('/joinrooms',middleware.requireAuthentication,function(req,res){
	res.status(200).json()
});

db.sequelize.sync({ 
	force: true
}).then(function(){
	http.listen(PORT,function(){
	console.log('Server started!!');
	});	
});
