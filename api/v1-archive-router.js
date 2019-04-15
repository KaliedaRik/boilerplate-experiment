const { 
	actionDeleteUser,
	actionGetArchive,
	actionPostArchive,
	actionPutArchive } = require('./v1-archive-actions.js');

const {
	_200_OK,
    _201_Created,
    _202_Accepted,
    _400_Bad_Request,
    _401_Unauthorized,
    _403_Forbidden,
    _409_Conflict,
    _500_Internal_Server_Error,

	checker,
	checkLoggedInUserCredentials,
	checkVisitorCredentials,
	extractBodyData,
	extractData,
	sender,
	sendError } = require('./v1-router-utilities.js')


// User management endpoints
// ---------------------------------------------------------------------- //

// TODO action
const routeDeleteUser = (req, res, next) => {

	return next();

// 	if(checkLoggedInUserCredentials(req, res)){

// 		let data = extractData(req, res, 'deleteUser');
// 		if(!data) return next();

// 		actionDeleteUser(data, req.user)
// 		.then((packet) => {
// 			sender(req, res, _200_OK, packet.resultCode);
// 			return next();
// 		})
// 		.catch((error) => {
// 			let code = (error && error.resultCode) ? error.resultCode : '9001:SYSTEM_ERROR';
// 			switch(code){
// 				case '1015:ERROR_DELETE_MISMATCH' :
// 					sender(req, res, _400_Bad_Request, code);
// 					break;
// 				default :
// 					sendError(req, res, error);
// 			}
// 			return next();
// 		});
// 	}
// 	else return next();
};

const routeGetArchive = (req, res, next) => {

	if(checkLoggedInUserCredentials(req, res)){

		actionGetArchive(req.user)
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

const routePostArchive = (req, res, next) => {

	return next();

	// let data = checkVisitorCredentials(req, res, 'postArchive');
	// if(!data) return next();

	// actionPostArchive(data)
	// .then((packet) => {
	// 	if(!res) throw '3004:DB_ERROR_USER';

	// 	sender(req, res, _201_Created, packet.resultCode, packet.data);
	// 	return next();
	// })
	// .catch((error) => {
	// 	let code = (error && error.resultCode) ? error.resultCode : '9001:SYSTEM_ERROR';
	// 	switch(code){
	// 		case '1003:ERROR_LOGIN' :
	// 			sender(req, res, _401_Unauthorized, code);
	// 			break;
	// 		case '1014:ERROR_LOGIN_UNARCHIVED' :
	// 			sender(req, res, _401_Unauthorized, code);
	// 			break;
	// 		case '3004:DB_ERROR_USER' :
	// 			sender(req, res, _403_Forbidden, code);
	// 			break;
	// 		default :
	// 			sendError(req, res, error);
	// 	}
	// 	return next();
	// });
};

const routePutArchive = (req, res, next) => {

	return next();

	if(checkLoggedInUserCredentials(req, res)){

		let data = extractData(req, res, 'putArchive');
		if(!data) return next();

		actionPutArchive(data, req.user)
		.then((packet) => {
			sender(req, res, _200_OK, packet.resultCode);
			return next();
		})
		.catch((error) => {
			let code = (error && error.resultCode) ? error.resultCode : '9001:SYSTEM_ERROR';
			switch(code){
				case '1011:ERROR_ARCHIVE_MISMATCH' :
					sender(req, res, _400_Bad_Request, code);
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
	routeDeleteUser,
	routeGetArchive,
	routePostArchive,
	routePutArchive,
};
