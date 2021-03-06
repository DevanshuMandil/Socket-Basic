var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports= function(sequelize,DataTypes){

	var user = sequelize.define('user',{

		username: {
			type: DataTypes.STRING,
			allowNull: false,
			validate:{
				len:[1,40]
			}
		},

		email:{
			type:DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true
			}
		},

		phone_no: {
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [10]
			}
		},

		salt:{
			type: DataTypes.STRING
		},

		password_hash: {
			type: DataTypes.STRING
		},

		password: {
			type: DataTypes.VIRTUAL,
			allowNull: false,
			validate: {
				len: [8,40]
			},

			set: function(value){
				var salt = bcrypt.genSaltSync(10);
				var password_hash = bcrypt.hashSync(value,salt);

				this.setDataValue('password',value);
				this.setDataValue('salt',salt);
				this.setDataValue('password_hash',password_hash);
			}
		}
	},	{
			hooks: {
				beforeValidate: function(user, option){
					if(typeof user.email === 'string')
					{
						user.email = user.email.toLowerCase();
					}
				}
			},

			classMethods:{
				authenticate: function(body){
					return new Promise(function(resolve, reject){
						if (typeof body.email !== 'string' || typeof body.password !== 'string') {
						return reject();
					}

					user.findOne({
						where: {
							email: body.email
						}
					}).then(function(user) {
						if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
							return reject();
						}

						resolve(user);
					}, function(e) {
						reject();
					});
					});
				},

				findByToken: function(token){
					return new Promise(function(resolve,reject){
						try{
								var decoderJWT = jwt.verify(token, 'qwerty098');
								var bytes = cryptojs.AES.decrypt(decoderJWT.token, 'abc123@#');
								var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

								user.findById(tokenData.id).then(function(user){
									if(user){
										resolve(user);
									}else{
										reject();
									}
								},function(e){
									reject();
								});
						}
						catch(e){
							reject();
							}
					});
				}
			},

			instanceMethods: {
				toPublicJSON: function(){
					var json = this.toJSON();
					return _.pick(json,'username','email','phone_no');
				},

				generateToken: function(type){
						if(!_.isString(type))
						{
							return undefined;
						}

						try{
							var stringData = JSON.stringify({id: this.get('id'), type: type});
							var encryptionData = cryptojs.AES.encrypt(stringData, 'abc123@#').toString();
							var token = jwt.sign({
								token: encryptionData
							}, 'qwerty098');

							return token;
						}catch(e){
							return undefined;
						}
					}
			}
	});
	return user;
}