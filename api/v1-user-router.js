const { 
	actionPutConfirmEmail,
	actionPutLogin,
	actionPostRecover,
	actionPutRecover,
	actionPostRegister,
	actionPutRegister,
	actionGetToken,
	actionPostTwofa,
	actionPutTwofa,
	// actionDeleteUser,
	actionPutUser } = require('./v1-user-actions.js');

const {
	_200_OK,
    _201_Created,
    _202_Accepted,
    _400_Bad_Request,
    _401_Unauthorized,
    _403_Forbidden,
    _500_Internal_Server_Error,

	checkLoggedInUserCredentials,
	checkVisitorCredentials,
	extractData,
	sender,
	sendError } = require('./v1-router-utilities.js')

// User management endpoints
// ---------------------------------------------------------------------- //

const routePutConfirmEmail = (req, res, next) => {

	let data = checkVisitorCredentials(req, res, 'putConfirmEmail');
	if(!data) return next();
	
	actionPutConfirmEmail(data)
	.then((packet) => {
		sender(req, res, _201_Created, '109:OK_EMAIL_UPDATED', packet.data);
		return next();
	})
	.catch((error) => {
		let code = (error && error.resultCode) ? error.resultCode : '9001:SYSTEM_ERROR';
		switch(code){
			case '3004:DB_ERROR_USER' :
				sender(req, res, _403_Forbidden, code);
				break;
			default :
				sendError(req, res, error);
		}
		return next();
	});
};

// done action
const routePutLogin = (req, res, next) => {

	let data = checkVisitorCredentials(req, res, 'putLogin');
	if(!data) return next();
	
	actionPutLogin(data)
	.then((packet) => {

		let code;

		if(packet.data && packet.data.token){
			code = (packet.data.isArchived) ? _202_Accepted : _201_Created;
		}
		else{
			code = _200_OK;
		}

		sender(req, res, code, packet.resultCode, packet.data);
		return next();
	})
	.catch((error) => {
		let code = (error && error.resultCode) ? error.resultCode : '9001:SYSTEM_ERROR';
		switch(code){
			case '1003:ERROR_LOGIN' :
				sender(req, res, _401_Unauthorized, code);
				break;
			case '1013:ERROR_LOGIN_ARCHIVED' :
				sender(req, res, _403_Forbidden, code);
				break;
			case '3004:DB_ERROR_USER' :
				sender(req, res, _403_Forbidden, code);
				break;
			default :
				sendError(req, res, error);
		}
		return next();
	});
};

// done action
const routePostRecover = (req, res, next) => {

	let data = checkVisitorCredentials(req, res, 'postRecover');
	if(!data) return next();
	
	actionPostRecover(data)
	.then((packet) => {
		let code = (packet.resultCode === '103:EMAIL_SENT') ? _200_OK : _201_Created;
		sender(req, res, code, packet.resultCode, packet.data);
		return next();
	})
	.catch((error) => {
		let code = (error && error.resultCode) ? error.resultCode : '9001:SYSTEM_ERROR';
		switch(code){
			case '3004:DB_ERROR_USER' :
				sender(req, res, _403_Forbidden, code);
				break;
			case '4002:ERROR_PASSWORD_MISMATCH' :
				sender(req, res, _401_Unauthorized, code);
				break;
			default :
				sendError(req, res, error);
		}
		return next();
	});
};

// done action
const routePutRecover = (req, res, next) => {

	let data = checkVisitorCredentials(req, res, 'putRecover');
	if(!data) return next();
	
	actionPutRecover(data)
	.then((packet) => {
		sender(req, res, _201_Created, '102:OK_AUTHORIZED', packet.data);
		return next();
	})
	.catch((error) => {
		let code = (error && error.resultCode) ? error.resultCode : '9001:SYSTEM_ERROR';
		switch(code){
			case '1003:ERROR_LOGIN' :
				sender(req, res, _403_Forbidden, code);
				break;
			default :
				sendError(req, res, error);
		}
		return next();
	});
};

// done action
const routePostRegister = (req, res, next) => {

	let data = checkVisitorCredentials(req, res, 'postRegister');
	if(!data) return next();
	
	actionPostRegister(data)
	.then((packet) => {
		let code = (packet.resultCode === '103:EMAIL_SENT') ? _200_OK : _201_Created;
		sender(req, res, code, packet.resultCode, packet.data);
		return next();
	})
	.catch((error) => {
		let code = (error && error.resultCode) ? error.resultCode : '9001:SYSTEM_ERROR';
		switch(code){
			case '1003:ERROR_LOGIN' :
				sender(req, res, _401_Unauthorized, code);
				break;
			case '1006:ERROR_EMAIL_BAD' :
				sender(req, res, _400_Bad_Request, code);
				break;
			case '1007:ERROR_DUPLICATE_USER' :
				sender(req, res, _400_Bad_Request, code);
				break;
			default :
				sendError(req, res, error);
		}
		return next();
	});
};

// done action
const routePutRegister = (req, res, next) => {

	let data = checkVisitorCredentials(req, res, 'putRegister');
	if(!data) return next();
	
	actionPutRegister(data)
	.then((packet) => {
		sender(req, res, _201_Created, '104:OK_REGISTER', packet.data);
		return next();
	})
	.catch((error) => {
		let code = (error && error.resultCode) ? error.resultCode : '9001:SYSTEM_ERROR';
		switch(code){
			case '1004:ERROR_TOKEN' :
				sender(req, res, _403_Forbidden, code);
				break;
			case '3004:DB_ERROR_USER' :
				sender(req, res, _403_Forbidden, code);
				break;
			default :
				sendError(req, res, error);
		}
		return next();
	});
};

// TODO action
const routeGetToken = (req, res, next) => {

	if(checkLoggedInUserCredentials(req, res)){

		let data = extractData(req, res, 'getToken');
		if(!data) return next();

		actionGetToken(req.user)
		.then((packet) => {
			sender(req, res, _201_Created, packet.resultCode, packet.data);
			return next();
		})
		.catch((error) => {
			sendError(req, res, error);
			return next();
		});
	}
	else return next();
};

// TODO action
const routeGetTwofa = (req, res, next) => {

	if(checkLoggedInUserCredentials(req, res)){

		let data = extractData(req, res, 'getTwofa');
		if(!data) return next();

		sender(req, res, _201_Created, '110:OK_2FA_DATA', {
			secret: req.user.twofaCode,
			image: req.user.twofaImage,
		});
		return next();
	}
	else return next();
};

// TODO action
const routePostTwofa = (req, res, next) => {

	if(checkLoggedInUserCredentials(req, res)){

		let data = extractData(req, res, 'postTwofa');
		if(!data) return next();

		actionPostTwofa(req.user, data.token)
		.then((packet) => {
			sender(req, res, _200_OK, packet.resultCode);
			return next();
		})
		.catch((error) => {
			let code = (error && error.resultCode) ? error.resultCode : '9001:SYSTEM_ERROR';
			switch(code){
				case '1004:ERROR_TOKEN' :
					sender(req, res, _400_Bad_Request, code);
					break;
				default :
					sendError(req, res, error);
			}
			return next();
		});
	}
	else return next()
};

const routePutTwofa = (req, res, next) => {

	let data = checkVisitorCredentials(req, res, 'putTwofa');

	if(!data) return next();
	
	if(data.userName !== req.user.user.userName){
		sender(req, res, _400_Bad_Request, '1005:ERROR_AUTHORIZATION');
		return next();
	}

	actionPutTwofa(req.user, data.token)
	.then((packet) => {
		sender(req, res, _201_Created, '102:OK_AUTHORIZED', packet.data);
		return next();
	})
	.catch((error) => {
		let code = (error && error.resultCode) ? error.resultCode : '9001:SYSTEM_ERROR';
		switch(code){
			case '1003:ERROR_LOGIN' :
				sender(req, res, _401_Unauthorized, code);
				break;
			case '1005:ERROR_AUTHORIZATION' :
				sender(req, res, _401_Unauthorized, code);
				break;
			case '1017:ERROR_TWOFA_CLOSED' :
				sender(req, res, _401_Unauthorized, code);
				break;
			case '3004:DB_ERROR_USER' :
				sender(req, res, _403_Forbidden, code);
				break;
			default :
				sendError(req, res, error);
		}
		return next();
	});
};

const routePutUser = (req, res, next) => {

	if(checkLoggedInUserCredentials(req, res)){

		let data = extractData(req, res, 'putUser');
		if(!data) return next();

		actionPutUser(data, req.user)
		.then((packet) => {
			sender(req, res, _201_Created, packet.resultCode, packet.data);
			return next();
		})
		.catch((error) => {
			let code = (error && error.resultCode) ? error.resultCode : '9001:SYSTEM_ERROR';
			switch(code){
				case '4001:ERROR_PASSWORD' :
				case '3002:DB_ERROR_UPDATE' :
				case '3004:DB_ERROR_USER' :
					sender(req, res, _500_Internal_Server_Error, code);
					break;
				default :
					sendError(req, res, error);
			}
			return next();
		});
	}
	else return next();
};

const routePutUserAuth = (req, res, next) => {

	if(checkLoggedInUserCredentials(req, res)){

		let data = extractData(req, res, 'putUserAuth');
		if(!data) return next();

		actionPutUserAuth(data, req.user)
		.then((packet) => {
			if(packet.resultCode === '106:OK_USER_UPDATED'){
				sender(req, res, _201_Created, packet.resultCode, packet.data);
			}
			else{
				sender(req, res, _200_OK, packet.resultCode, {});
			}
			return next();
		})
		.catch((error) => {
			let code = (error && error.resultCode) ? error.resultCode : '9001:SYSTEM_ERROR';
			switch(code){
				case '3005:DB_ERROR_KEY' :
				case '3002:DB_ERROR_UPDATE' :
				case '3004:DB_ERROR_USER' :
					sender(req, res, _500_Internal_Server_Error, code);
					break;
				case '1019:ILLEGAL_ACTION' :
					sender(req, res, _403_Forbidden, code);
					break;
				default :
					sendError(req, res, error);
			}
			return next();
		});
	}
	else return next();
};


module.exports = {
	routePutConfirmEmail,
	routePutLogin,
	routePostRecover,
	routePutRecover,
	routePostRegister,
	routePutRegister,
	routeGetToken,
	routeGetTwofa,
	routePostTwofa,
	routePutTwofa,
	routePutUserAuth,
	routePutUser,
};
