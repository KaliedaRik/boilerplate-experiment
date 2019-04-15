const jwt = require('jsonwebtoken');
const moment = require('moment');
const uuid = require('uuid/v4');

const defaultExpiresLimit = 72;	// HARDCODED magic value - ought to be set in a z- environment variable


// create and parse tokens
const makeToken = (data, secret, expiresLimit) => {
	return new Promise((resolve, reject) => {

		let packet = {},
			expires;

		expiresLimit = (expiresLimit && expiresLimit.toFixed) ? expiresLimit : defaultExpiresLimit;

		if(secret && data && data.name){

			expires = moment().add(expiresLimit, 'hours').unix();

			packet.email = data.email || 'emailUnset';
			packet.isActive = (data.isActive) ? `user${data.userName}IsActive` : `user${data.userName}IsStatic`;
			packet.isArchived = (data.isArchived) ? `user${data.userName}IsArchived` : `user${data.userName}IsStillAround`;
			packet.isHuman = (data.isHuman) ? `user${data.userName}IsHuman` : `user${data.userName}IsBot`;
			packet.locale = data.locale || 'localeUnset';
			packet.name = data.name;
			packet.userName = data.userName;
			packet.tokenExpires = expires;

			// because I don't fully understand JWT and how much data we need to pack into it to make it more secure
			// - I'm going to pack it with garbage data, because I don't want to add any user-unique data or tokens to it
			packet.salt = uuid();
			packet.and = `This is some ${uuid()} nonsense filler`;
			packet.vinegar = `... and this filler is ${uuid()} nonsense too`;
			packet.crisps = uuid();
	
			signToken(packet, secret)
			.then((token) => {
				resolve({
					token: token,
					secret: secret,
					expires: moment.unix(expires).toISOString()
				});
			})
			.catch((error) => {
				resolve(false);
			});
		}
		else{
			resolve(false);
		}
	});
};

const signToken = (data, secret) => {
	return new Promise((resolve, reject) => {
		if(data){

			jwt.sign({
				data: data,
				exp: data.tokenExpires,
				iss: 'Rikworks-boilerplate-demo', 	// HARDCODED magic value - ought to be set in a z- environment variable
			}, secret, (error, token) => {
				if(error){
					reject(error);
				}
				resolve(token);
			});
		}
		else{
			reject('missing data');
		}
	});
};

const verifyToken = (token, secret) => {
	return new Promise((resolve, reject) => {

		if(token && secret){
			jwt.verify(token, secret, (error, decoded) => {
				if(error){
					resolve(false);
				}

				if(decoded && decoded.data){
					let keys = Object.keys(decoded.data);
					if(keys.length === 11){
						resolve({
							data: decoded,
							expires: moment(decoded.data.tokenExpires * 1000).toISOString(),
							token: token,
						});
					}
				}
				resolve(false);
			});
		}
		else{
			resolve(false);
		}
	});
};

module.exports = {
	makeToken,
	verifyToken,
};
