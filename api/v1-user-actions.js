const moment = require('moment');

const {
	createToken,
	retrieveToken,
	initializeNewUser,
	confirmNewUser,
	recordLogin,
	retrieveAdminKeys,
	getUser,
	updateUser,
	updateUserEmail,
	deleteUser,
	deleteUserByNameAction } = require('./v1-database.js');

const { 
	cascadeHead,
	checkPassword,
	encryptPassword, 
	getServerEnvironmentVariables,
	makeToken,
	makeTwofaCodes,
	makeUuid, 
	verifyEmail,
	verifyTwofaToken } = require('./utilities.js');

const { emailer,
	defaultLocale,
	humanAuthTokenExpires, 
	singleUseTokenExpires } = getServerEnvironmentVariables();

const { postSystemEmail } = require(`./plugin-${emailer}.js`);

const regularUpdatesNotPermittedFor = [
	'isAdministrator',
	'canArchiveOtherUsers',
	'canDeleteOtherUsers',
];


// HELPER FUNCTIONS - supporting various end points
// ---------------------------------------------------------------------- //

const createErrorPacket = (e) => {

	if(e != null){
		if(e.substring){
			return { resultCode: e };
		}
		return e;
	}
	return { resultCode: '9001:SYSTEM_ERROR' };
};

const createUserReturnPacket = (user, auth, token) => {

	let packet = {
		key: user._key,
		userName: user.userName,
		name: user.name,
		locale: user.locale || defaultLocale,
		twofaIsEnabled: user.twofaIsEnabled,
		isArchived: user.isArchived,
	};

	if(user.email != null){
		packet.email = user.email;
	}

	if(user.newEmail != null){
		packet.newEmail = user.newEmail;
	}

	if(auth){
		packet.isAdministrator = auth.isAdministrator;
		packet.canArchiveOtherUsers = auth.canArchiveOtherUsers;
		packet.canDeleteOtherUsers = auth.canDeleteOtherUsers;
	}

	if(token){
		packet.token = token.token;
		packet.tokenExpires = token.expires;
	}

	return packet;
};

const prepareNewUserData = (data) => {
	return new Promise((resolve, reject) => {

		data.isActive = true;
		data.isAdministrator = data.isAdministrator || false;
		data.canArchiveOtherUsers = data.canArchiveOtherUsers || false;
		data.canDeleteOtherUsers = data.canDeleteOtherUsers || false;
		data.tokenSecret = makeUuid();

		encryptPassword(data.password)
		.then((res) => {
			if(!res) throw '4001:ERROR_PASSWORD';

			data.hash = res;
			if(data.recoveryPhrase){
				return encryptPassword(data.recoveryPhrase);
			}
			return true;
		})
		.then((res) => {
			if(!res) throw '4001:ERROR_PASSWORD';

			data.recoveryHash = (res.substring) ? res : '';
			return makeTwofaCodes();
		})
		.then((res) => {
			if(!res || !res.secret || !res.image) throw '4001:ERROR_PASSWORD';

			data.twofaCode = res.secret;
			data.twofaImage = res.image;
			data.twofaIsEnabled = false;

			return retrieveAdminKeys();
		})
		.then((res) => {

			if(res && !res.length){
				data.isAdministrator = true;
			}

			resolve(data);
		})
		.catch((err) => {
			console.log('prepareNewUserData', err);
			resolve(err);
		});
	});
};

const addNewUserWithDirectResponse = (data) => {
	return new Promise((resolve, reject) => {

		let user, secrets, auths, token, packet;

		prepareNewUserData(data)
		.then((updatedData) => {

			if(!updatedData || updatedData.substring) throw updatedData;

			return initializeNewUser(updatedData);
		})
		.then((res) => {

			if(!res || !res.user || !res.secrets || !res.auths) throw '1003:ERROR_LOGIN';

			user = res.user;
			secrets = res.secrets;
			auths = res.auths;

			return makeToken(user, secrets.tokenSecret, humanAuthTokenExpires);
		})
		.then((res) => {

			if(!res) throw '4003:ERROR_TOKEN_GENERATION';

			token = res;

			return confirmNewUser(user._key, token.expires);
		})
		.then((res) => {

			if(!res || !res.user || !res.auths) throw '3002:DB_ERROR_UPDATE';

			packet = createUserReturnPacket(res.user, res.auths, token);

			resolve({
				resultCode: '104:OK_REGISTER',
				data: packet
			});
		})
		.catch((err) => reject(createErrorPacket(err)));
	});
};

const addNewUserWithEmailConfirmation = (data) => {
	return new Promise((resolve, reject) => {

		let user, token, packet;

		verifyEmail(data.email)
		.then((res) => {

			if(!res) throw '1006:ERROR_EMAIL_BAD';

			return prepareNewUserData(data);
		})
		.then((updatedData) => {

			if(!updatedData || updatedData.substring) throw updatedData;

			return initializeNewUser(updatedData);
		})
		.then((res) => {

			if(!res) throw '1003:ERROR_LOGIN';

			user = res.user;
			token = makeUuid();

			return createToken(token, user.userName);
		})
		.then((res) => {

			if(!res) throw '4003:ERROR_TOKEN_GENERATION';

			packet = {
				name: user.name,
				user: user.userName,
				token: token
			};

			return postSystemEmail('register', packet, [user.email], user.locale);
		})
		.then((res) => {

			if(!res) throw '2001:ERROR_EMAIL_NOT_SENT';

			resolve({ resultCode: '103:EMAIL_SENT' });

		})
		.catch((err) => reject(createErrorPacket(err)));
	});
};

const loginUser = (user, auths, tokenSecret) => {
	return new Promise((resolve, reject) => {

		let token, packet;

		makeToken(user, tokenSecret, humanAuthTokenExpires)
		.then((res) => {

			if(!res) throw '4003:ERROR_TOKEN_GENERATION';

			token = res;

			return recordLogin(user._key, token.expires);
		})
		.then((res) => {
			if(!res) throw '3002:DB_ERROR_UPDATE';

			packet = createUserReturnPacket(user, auths, token);

			resolve({
				resultCode: '102:OK_AUTHORIZED',
				data: packet
			});
		})
		.catch((err) => reject(createErrorPacket(err)));
	});
};

const loginUserWithTwofa = (user) => {
	return new Promise((resolve, reject) => {

		let packet;

		recordLogin(user._key, false, true)
		.then((res) => {
			if(!res) throw '3002:DB_ERROR_UPDATE';

			packet = createUserReturnPacket(user);

			resolve({
				resultCode: '111:OK_2FA_LOGIN',
				data: packet
			});
		})
		.catch((err) => reject(createErrorPacket(err)));
	});
};

const recoverPasswordWithDirectResponse = (userData, data) => {
	return new Promise((resolve, reject) => {

		let user = userData.user,
			secrets = userData.secrets,
			packet;

		cascadeHead()
		.then((res) => {

			if(!secrets.recoveryHash) throw '1001:ERROR_DATA';

			return checkPassword(data.phrase, secrets.recoveryHash);
		})
		.then((res) => {

			if(!res) throw '4002:ERROR_PASSWORD_MISMATCH';

			return createToken(data.token, user.userName);
		})
		.then((res) => {

			if(!res) throw '4003:ERROR_TOKEN_GENERATION';

			resolve({
				resultCode: '105:OK_RECOVER',
				data: { token: data.token }
			});
		})
		.catch((err) => reject(createErrorPacket(err)));
	});
};

const recoverPasswordWithEmailConfirmation = (userData, data) => {
	return new Promise((resolve, reject) => {

		let user = userData.user,
			packet;

		createToken(data.token, user.userName)
		.then((res) => {

			if(!res) throw '4003:ERROR_TOKEN_GENERATION';

			packet = {
				name: user.name,
				token: data.token
			};

			return postSystemEmail('recoverPassword', packet, [user.email], user.locale);
		})
		.then((res) => {

			if(!res) throw '2001:ERROR_EMAIL_NOT_SENT';

			resolve({ resultCode: '103:EMAIL_SENT' });
		})
		.catch((err) => reject(createErrorPacket(err)));
	});
};

const updateUserWithDirectResponse = (user, auths, data) => {
	return new Promise((resolve, reject) => {

		let packet = createUserReturnPacket(user, auths),
			code = (data.email === '') ? '107:OK_DELETED_EMAIL_WARNING' : '106:OK_USER_UPDATED';

		resolve({
			resultCode: code,
			data: packet
		});
	});
};

const updateUserWithEmailResponse = (user, auths) => {
	return new Promise((resolve, reject) => {

		let emailPacket, resPacket,
			token = makeUuid();

		cascadeHead()
		.then((res) => {

			if(!user.newEmail || !user.name) throw '1001:ERROR_DATA';

			return createToken(token, user.userName);
		})
		.then((res) => {

			if(!res) throw '4003:ERROR_TOKEN_GENERATION';

			emailPacket = {
				name: user.name,
				token: token
			};

			return postSystemEmail('updateEmail', emailPacket, [user.newEmail], user.locale);
		})
		.then((res) => {

			if(!res) throw '2001:ERROR_EMAIL_NOT_SENT';

			resPacket = createUserReturnPacket(user, auths);

			resolve({
				resultCode: '108:OK_UPDATED_EMAIL_WARNING',
				data: resPacket
			});
		})
		.catch((err) => reject(createErrorPacket(err)));
	});
};


// EXPORTED FUNCTIONS
// ---------------------------------------------------------------------- //

const actionPutConfirmEmail = (data) => {
	return new Promise((resolve, reject) => {

		let userData, packet, token;

		getUser(data)
		.then((res) => {

			if(!res || !res.user || !res.secrets) throw '3004:DB_ERROR_USER';

			userData = res;

			if(userData.user.isArchived) throw '1013:ERROR_LOGIN_ARCHIVED';

			if(userData.user.twofaTriggered) throw '1016:ERROR_TWOFA_INCOMPLETE';

			if(data.user !== userData.user.userName && data.user !== userData.user.newEmail) throw '1001:ERROR_DATA';

			return updateUserEmail(userData.user._key);
		})
		.then((res) => {

			if(!res) throw '3002:DB_ERROR_UPDATE';

			return getUser({key: userData.user._key});
		})
		.then((res) => {

			if(!res || !res.user || !res.secrets || !res.auths) throw '3004:DB_ERROR_USER';

			userData = res;

			return makeToken(userData.user, userData.secrets.tokenSecret, humanAuthTokenExpires);
		})
		.then((res) => {

			if(!res) throw '4003:ERROR_TOKEN_GENERATION';

			token = res;

			packet = createUserReturnPacket(userData.user, userData.auths, token);

			resolve({
				resultCode: '102:OK_AUTHORIZED',
				data: packet
			});
		})
		.catch((err) => reject(createErrorPacket(err)));
	});
};

const actionPutLogin = (data) => {
	return new Promise((resolve, reject) => {

		let user, secrets, auths;

		/.+?@.+?\..+/.test(data.user) ? 
			data.email = data.user :
			data.userName = data.user;

		getUser(data)
		.then((res) => {

			if(!res) throw '3004:DB_ERROR_USER';

			user = res.user;
			secrets = res.secrets;
			auths = res.auths;

			if(!user) throw '3004:DB_ERROR_USER';

			if(user.isArchived) throw '1013:ERROR_LOGIN_ARCHIVED';

			if(user.twofaTriggered) throw '1016:ERROR_TWOFA_INCOMPLETE';

			return checkPassword(data.password, secrets.hash);
		})
		.then((res) => {

			if(!res) throw '1003:ERROR_LOGIN';

			if(user.twofaIsEnabled){
				return loginUserWithTwofa(user);
			}
			else{
				return loginUser(user, auths, secrets.tokenSecret);
			}
		})
		.then((res) => resolve(res))
		.catch((err) => reject(createErrorPacket(err)));
	});
};

const actionPostRecover = (data) => {
	return new Promise((resolve, reject) => {

		let user;

		/.+?@.+?\..+/.test(data.user) ?
			data.email = data.user :
			data.userName = data.user;

		cascadeHead()
		.then((res) => {

			if(data.userName && !data.phrase) throw '1001:ERROR_DATA';

			return getUser(data);
		})
		.then((res) => {

			if(!res || !res.user || !res.secrets) throw '3004:DB_ERROR_USER';

			user = res;

			data.token = makeUuid();

			if(data.email){
				return recoverPasswordWithEmailConfirmation(user, data);
			}
			else{
				return recoverPasswordWithDirectResponse(user, data);
			}
		})
		.then((res) => resolve(res))
		.catch((err) => reject(createErrorPacket(err)));
	});
};

const actionPutRecover = (data) => {
	return new Promise((resolve, reject) => {

		let user, secrets, auths, token, packet;

		getUser(data)
		.then((res) => {

			if(!res || !res.user || !res.secrets) throw '1003:ERROR_LOGIN';

			user = res.user;
			secrets = res.secrets;
			auths = res.auths;

			return encryptPassword(data.password);
		})
		.then((res) => {

			if(!res) throw '4001:ERROR_PASSWORD';

			data.hash = res;
			return makeToken(user, secrets.tokenSecret, humanAuthTokenExpires);
		})
		.then((res) => {

			if(!res) throw '4003:ERROR_TOKEN_GENERATION';

			token = res;

			return updateUser({ hash: data.hash }, user._key);
		})
		.then((res) => {

			if(!res) throw '3002:DB_ERROR_UPDATE';

			return recordLogin(user._key, token.expires, false);
		})
		.then((res) => {

			if(!res) throw '3002:DB_ERROR_UPDATE';

			packet = createUserReturnPacket(user, auths, token);

			resolve({
				resultCode: '113:OK_PASSWORD',
				data: packet
			});
		})
		.catch((err) => reject(createErrorPacket(err)));
	});
};

const actionPostRegister = (data) => {
	return new Promise((resolve, reject) => {

		getUser(data)
		.then((res) => {
			if(res) throw '1007:ERROR_DUPLICATE_USER';

			if(data.email){
				return addNewUserWithEmailConfirmation(data);
			}
			else{
				return addNewUserWithDirectResponse(data);
			}
		})
		.then((res) => resolve(res))
		.catch((err) => reject(createErrorPacket(err)));
	});
};

const actionPutRegister = (data) => {
	return new Promise((resolve, reject) => {

		let userData, token, packet;

		getUser(data)
		.then((res) => {

			if(!res || !res.user || !res.secrets || !res.auths) throw '1004:ERROR_TOKEN';

			userData = res;

			return makeToken(userData.user, userData.secrets.tokenSecret, humanAuthTokenExpires);
		})
		.then((res) => {

			if(!res) throw '4003:ERROR_TOKEN_GENERATION';

			token = res;

			return confirmNewUser(userData.user._key, token.expires);
		})
		.then((res) => {
			if(!res) throw '3002:DB_ERROR_UPDATE';

			packet = createUserReturnPacket(userData.user, userData.auths, token);

			resolve({
				resultCode: '104:OK_REGISTER',
				data: packet
			});
		})
		.catch((err) => reject(createErrorPacket(err)));
	});
};

const actionGetToken = (data) => {
	return new Promise((resolve, reject) => {

		let packet = {};

		if(data && data.user && data.auths && data.secrets && data.secrets.tokenSecret){

			loginUser(data.user, data.auths, data.secrets.tokenSecret)
			.then((res) => {

				if(res && res.resultCode === '102:OK_AUTHORIZED'){
					res.resultCode ='112:OK_TOKEN_REFRESHED';
				}

				resolve(res);
			})
			.catch((err) => reject(createErrorPacket(err)));
		}
	});
};

const actionPostTwofa = (userData, twofaToken) => {
	return new Promise((resolve, reject) => {

		twofaToken = '' + twofaToken;

		if(twofaToken && userData && userData.secrets && userData.secrets.twofaCode){

			verifyTwofaToken(userData.secrets.twofaCode, twofaToken)
			.then((res) => {

				if(!res) throw '1004:ERROR_TOKEN';

				resolve({ resultCode: '101:OK_BASIC' });
			})
			.catch((err) => reject(createErrorPacket(err)));
		}
		else{
			reject({ resultCode: '1001:ERROR_DATA' });
		}

	});
};

const actionPutTwofa = (userData, twofaToken) => {
	return new Promise((resolve, reject) => {

		let packet, user, secrets, auths, token;

		cascadeHead()
		.then((res) => {

			if(!userData || !userData.user || !userData.secrets || !userData.auths) throw '1003:ERROR_LOGIN';

			user = userData.user;
			secrets = userData.secrets;
			auths = userData.auths;
			twofaToken = '' + twofaToken;

			if(!user.twofaTriggered || !user.twofaWindowCloses || moment().utc().isAfter(user.twofaWindowCloses)) throw '1017:ERROR_TWOFA_CLOSED';

			return verifyTwofaToken(secrets.twofaCode, twofaToken);
		})
		.then((res) => {

			if(!res) throw '1005:ERROR_AUTHORIZATION';

			return makeToken(user, secrets.tokenSecret, humanAuthTokenExpires);
		})
		.then((res) => {

			if(!res) throw '4003:ERROR_TOKEN_GENERATION';

			token = res;

			return recordLogin(user._key, token.expires);
		})
		.then((res) => {

			if(!res) throw '3002:DB_ERROR_UPDATE';

			packet = createUserReturnPacket(user, auths, token);

			resolve({
				resultCode: '102:OK_AUTHORIZED',
				data: packet
			});
		})
		.catch((err) => reject(createErrorPacket(err)));
	});
};

const actionPutUser = (data, userData) => {
	return new Promise((resolve, reject) => {

		let user = userData.user,
			secrets = userData.secrets,
			auths = userData.auths,
			items, item, i, iz;

		items = Object.keys(data);
		for(i = 0, iz = items.length; i < iz; i++){
			item = items[i];
			if(regularUpdatesNotPermittedFor.indexOf(item) >= 0){
				delete data[item];
			}
		}

		cascadeHead()
		.then((res) => {

			if(data.hash){
				delete data.hash;
			}
			if(data.password){
				return encryptPassword(data.password);
			}
			return true;
		})
		.then((res) => {

			if(!res) throw '4001:ERROR_PASSWORD';

			data.hash = (res.substring) ? res : secrets.hash;

			if(data.recoveryHash){
				delete data.recoveryHash;
			}
			if(data.recoveryPhrase){
				return encryptPassword(data.recoveryPhrase);
			}
			return true;
		})
		.then((res) => {

			if(!res) throw '4001:ERROR_PASSWORD';

			data.recoveryHash = (res.substring) ? res : secrets.recoveryHash;

			return updateUser(data, user._key);
		})
		.then((res) => {

			if(!res) throw '3002:DB_ERROR_UPDATE';

			return getUser({key: user._key});
		})
		.then((res) => {

			if(!res) throw '3004:DB_ERROR_USER';

			user = res.user;
			auths = res.auths;

			if(data.email){
				return updateUserWithEmailResponse(user, auths);
			}
			else{
				return updateUserWithDirectResponse(user, auths, data);
			}
		})
		.then((res) => resolve(res))
		.catch((err) => reject(createErrorPacket(err)));
	});
};

const actionPutUserAuth = (data, userData) => {
	return new Promise((resolve, reject) => {

		let user = userData.user,
			secrets = userData.secrets,
			auths = userData.auths,
			items, item, i, iz, key, packet;

		if(!auths.isAdministrator) throw '1018:ERROR_PERMISSIONS_FAIL';

		key = data.key;

		items = Object.keys(data);
		for(i = 0, iz = items.length; i < iz; i++){
			item = items[i];
			if(regularUpdatesNotPermittedFor.indexOf(item) < 0){
				delete data[item];
			}
		}

		if(key === user._key){

			retrieveAdminKeys()
			.then((res) => {

				if(!res || !res.length) throw '3005:DB_ERROR_KEY';

				if(data.isAdministrator != null && !data.isAdministrator && res.length < 2) throw '1019:ILLEGAL_ACTION';

				return updateUser(data, user._key);
			})
			.then((res) => {

				if(!res) throw '3002:DB_ERROR_UPDATE';

				return getUser({key: user._key});
			})
			.then((res) => {

				if(!res) throw '3004:DB_ERROR_USER';

				user = res.user;
				auths = res.auths;

				packet = createUserReturnPacket(user, auths);

				resolve({ 
					resultCode: '106:OK_USER_UPDATED',
					data: packet
				});
			})
			.catch((err) => reject(createErrorPacket(err)));
		}
		else{

			updateUser(data, key)
			.then((res) => {

				if(!res) throw '3002:DB_ERROR_UPDATE';

				resolve({ resultCode: '114:OK_OTHER_USER_UPDATED' });
			})
			.catch((err) => reject(createErrorPacket(err)));
		}
	});
};


module.exports = {
	actionPutConfirmEmail,
	actionPutLogin,
	actionPostRecover,
	actionPutRecover,
	actionPostRegister,
	actionPutRegister,
	actionGetToken,
	actionPostTwofa,
	actionPutTwofa,
	actionPutUser,
	actionPutUserAuth,
};
