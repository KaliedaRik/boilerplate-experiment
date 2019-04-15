const moment = require('moment');

const { 
	checkForExpectedFields,
	testForm } = require('./validateData.js');

const _200_OK = 200,
    _201_Created = 201,
    _202_Accepted = 202,
    _400_Bad_Request = 400,
    _401_Unauthorized = 401,
    _403_Forbidden = 403,
    _409_Conflict = 409,
    _500_Internal_Server_Error = 500;
    

// check that all required data is present in various request actions
// - details of expected fields, alongside validation tests, can be found in validations.js file
const checker = (formName, data) => {

	if(!checkForExpectedFields(formName, data)){
		return '1001:ERROR_DATA';
	}
	if(!testForm(formName, data)){
		return '1002:ERROR_DATA_VALIDATION';
	}
	return 0;
};

// extract body data
const extractBodyData = (req, res, verifyData) => {

// console.log('extractBodyData 1');
// let b = req.body, k = Object.keys(b);
// console.log('extractBodyData 2', k);
// for(let i=0, iz=req.body.length; i<iz;i++){
// console.log(`extractBodyData 3.${i}`, k[1], b[i]);
// }

	// let data = JSON.parse(JSON.stringify(req.body)) || {},
	let data = req.body || {},
		check;

	check = checker(verifyData, data);

	return (check) ? check : data;
};

// send appropriate response
const sender = (req, res, code, err, packet) => {

	let e = err.split(':'),
		eVal = parseInt(e[0], 10);

	let data = {
		error: (eVal < 1000) ? 0 : eVal,
		message: req.localeCopy[err],
		packet: (packet && typeof packet === 'object') ? packet : {}
	}

	try{
		res.send(code, data);
	}
	catch(e){
		console.log(e)
	};
};

// send appropriate 500 error response
const sendError = (req, res, err) => {
	if(err && err.resultCode){
		sender(req, res, _500_Internal_Server_Error, err.resultCode);
	}
	else{
		sender(req, res, _500_Internal_Server_Error, '9001:SYSTEM_ERROR');
	}
};

const checkLoggedInUserCredentials = (req, res) => {

	if(!req.verifiedToken || !req.user){
		sender(req, res, _403_Forbidden, '1004:ERROR_TOKEN');
		return false;
	}

	if(req.verifiedToken.expires == null || req.user.user.tokenExpires == null || moment().isAfter(req.verifiedToken.expires) || moment().isAfter(req.user.user.tokenExpires)){
		sender(req, res, _403_Forbidden, '1010:ERROR_TOKEN_STALE');
		return false;
	}

	if(req.verifiedToken.data == null || req.verifiedToken.data.userName !== req.user.user.userName){
		sender(req, res, _403_Forbidden, '1004:ERROR_TOKEN');
		return false;
	}

	if(req.body == null || req.body.userName == null || (req.user.user.userName !== req.body.userName)){
		sender(req, res, _400_Bad_Request, '1002:ERROR_DATA_VALIDATION');
		return false;
	}

	return true;
};

const checkVisitorCredentials = (req, res, form) => {

	if(req.verifiedToken){
		sender(req, res, _409_Conflict, '1008:ERROR_DUPLICATE_LOGIN');
		return false;
	}

	return extractData(req, res, form);
};

const extractData = (req, res, form) => {

	let data = extractBodyData(req, res, form);
	if(data.substring){
		sender(req, res, _400_Bad_Request, data);
		return false;
	}

	return data;
};


module.exports = {
	checker,
	checkLoggedInUserCredentials,
	checkVisitorCredentials,
	extractBodyData,
	extractData,
	sender,
	sendError,

	_200_OK,
    _201_Created,
    _202_Accepted,
    _400_Bad_Request,
    _401_Unauthorized,
    _403_Forbidden,
    _409_Conflict,
    _500_Internal_Server_Error,
};




