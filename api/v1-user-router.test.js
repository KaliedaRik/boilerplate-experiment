// NOTE - THESE TESTS WILL FAIL IF THE ARANGOdb SERVER IS NOT RUNNING

// If running email tests, update email addresses here
const firstEmailAddress = 'hello@rikworks.co.uk',  	// HARDCODED DATA that needs to be separated out into a Z- file
	secondEmailAddress = 'rik.roots@gmail.com';  	// HARDCODED DATA that needs to be separated out into a Z- file

process.env.MYENVIRONMENT = 'dev';

const { 
	deleteUserByNameAction,
	createToken,
	getUser } = require('./v1-database.js');

const { 
	routePutConfirmEmail,	// tested (email only)
	routePutLogin, 			// tested (email); tested (no email)
	routePostRecover,		// tested (email); tested (no email)
	routePutRecover,		// tested (email only)
	routePostRegister, 		// tested (email); tested (no email)
	routePutRegister, 		// tested (email only)
	routeGetToken,			// tested
	routeGetTwofa,			// tested
	routePostTwofa,			// tested
	routePutTwofa,			// tested
	routePutUserAuth,		// NOT TESTED YET
	routePutUser } = require('./v1-user-router.js'); 	// tested (email); tested (no email)

const { generateTwofaToken } = require('./utilities.js');

const index = require('./locales/en-copy.js').index;


// MOCK req and res
// -------------------------------------------------------------------------------

var currentPacket;
var flag = true;

DummyReq = function() {
	/*
	{
		userKey: string, 
		username: string, 
		user: object, 
		token: string, 
		verifiedToken: object, 
		body: object
	}
	*/
	this.body = {};
	return this;
}
DummyReq.prototype = Object.create(Object.prototype);
DummyReq.prototype.locale = 'en';
DummyReq.prototype.localeCopy = index;

DummyRes = function(code, error, errMsg) {

	this.code = code;
	this.error = error;
	this.msg = index[errMsg];
	return this;
}
DummyRes.prototype = Object.create(Object.prototype);
DummyRes.prototype.send = function(code, data) {

	// console.log(`${code}:${this.code}, ${data.error}:${this.error}, ${data.message}:${this.msg}`);

	try{
		expect(code).toBe(this.code);
		expect(data.error).toBe(this.error);
		expect(data.message).toBe(this.msg);
	}
	catch(e){ console.log(e.message); flag = false }

	if(data.packet && Object.keys(data.packet).length){
		currentPacket = data.packet;
	}
};

const myPromise = (func, args) => {
	return new Promise((resolve, reject) => {
		let next = () => resolve(true);
		func(...args, next);
	});
};


// TESTS
// -------------------------------------------------------------------------------

// 1. POST /register - missing data
// 2. POST /register - too much data
// 3. POST /register - correct data with auth token
// 4. POST /register - correct data
// 5. PUT /login - incorrect userName
// 6. PUT /login - incorrect password
// 7. PUT /login - correct data
// 8. PUT /login - correct data with auth token
test('v1URouter-01 - POST/register, PUT/login (no email)', () => {

	let msg = '';
	flag = true;

	let vt = {
		expires: '2040-01-01T00:00:00',
		data: {
			userName: 'testa.dummy.1'
		}
	};

	let req = new DummyReq();
	req.body.password = 'mypassword';
	req.body.locale = 'en';
	let res = new DummyRes(400, 1002, '1002:ERROR_DATA_VALIDATION');

	// password
	return myPromise(routePostRegister, [req, res])
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routePostRegister #3 failed\n'}

		req.body.name = 'TestA Dummy';
		req.body.cat = 'Tabbie';
		res = new DummyRes(400, 1001, '1001:ERROR_DATA');

		// password, name, cat
		return myPromise(routePostRegister, [req, res])
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routePostRegister #4 failed\n'}

		delete req.body.cat;
		req.verifiedToken = vt;
		res = new DummyRes(409, 1008, '1008:ERROR_DUPLICATE_LOGIN');

		// password, name (verifiedToken)
		return myPromise(routePostRegister, [req, res])
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routePostRegister #5 failed\n'}

		req.verifiedToken = false;
		res = new DummyRes(201, 0, '104:OK_REGISTER');

		// password, name
		return myPromise(routePostRegister, [req, res])
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routePostRegister #6 failed\n'}

		delete req.body.name;
		req.body.user = 'testa.dummy.2';
		res = new DummyRes(403, 3004, '3004:DB_ERROR_USER');

		// password, user
		return myPromise(routePutLogin, [req, res]);
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routePutLogin #7 failed\n'}

		req.body.password = 'mywrongpassword';
		req.body.user = 'testa.dummy.1';
		res = new DummyRes(401, 1003, '1003:ERROR_LOGIN');

		// password, user
		return myPromise(routePutLogin, [req, res]);
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routePutLogin #8 failed\n'}

		req.body.password = 'mypassword';
		res = new DummyRes(201, 0, '102:OK_AUTHORIZED');

		// password, user
		return myPromise(routePutLogin, [req, res]);
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routePutLogin #9 failed\n'}

		req.verifiedToken = vt;
		res = new DummyRes(409, 1008, '1008:ERROR_DUPLICATE_LOGIN');

		// password, user (verifiedToken)
		return myPromise(routePutLogin, [req, res]);
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routePutLogin #10 failed\n'}

		if(msg.length) throw msg;

		return deleteUserByNameAction('testa.dummy.1');
	})
	// .then((res) => console.log((res) ? 'testa.dummy.1 deleted' : 'Database cleanup required for testa.dummy.1'))
	.then((res) => {})
	.catch((err) => {

		console.log(`v1URouter-01 errors:\n${err}`);
		deleteUserByNameAction('testa.dummy.1');
		expect(err).toBeFalsy();
	});
});


// 1. POST /register - correct data including malformed email
// 2. POST /register - correct data including correct email
// 3. PUT /register - too much data
// 4. PUT /register - missing data
// 5. PUT /register - incorrect token
// 6. PUT /register - correct token
// 7. PUT /login - incorrect email
// 8. PUT /login - correct email
// 9. POST /recover - incorrect data
// 10. POST /recover - correct data
// 11. PUT /recover - incorrect data
// 12. PUT /recover - correct data
// 13. PUT /user - updated email address
// 14. PUT /confirm-email - incorrect token - TODO
// 15. PUT /confirm-email - correct token - TODO
// 16. PUT /user - zero-string email address

// UNCOMMENT TO TEST REGISTRATION, RECOVERY and UPDATE FUNCTIONALITY for users with EMAIL ADDRESSES
// - test may fail if email-related tests are also being conducted in v1-user-actions.test.js with the same email addresses

// test('v1URouter-02 - POST/register (email), PUT/register, POST/recover, PUT/recover, PUT/user (email), PUT/confirm-email', () => {

// 	let msg = '';
// 	let user;
// 	flag = true;

// 	let nonceToken = '00000000-0000-0000-0000-000000000000',
// 		testBToken1 = 'testBdum-mmy1-0000-0000-000000000000',
// 		testBToken2 = 'testBdum-mmy2-0000-0000-000000000000',
// 		testBToken3 = 'testBdum-mmy3-0000-0000-000000000000';

// 	let vt = {
// 		expires: '2040-01-01T00:00:00',
// 		data: {
// 			userName: 'testb.dummy.1'
// 		}
// 	};

// 	let req = new DummyReq();
// 	req.body.name = 'TestB Dummy';
// 	req.body.password = 'mypassword';
// 	req.body.locale = 'en';
// 	req.body.email = 'hello@malformed_email';

// 	let res = new DummyRes(400, 1006, '1006:ERROR_EMAIL_BAD');

// 	// name, password, email (bad)
// 	return myPromise(routePostRegister, [req, res])
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePostRegister #11 failed\n'}

// 		req.body.email = firstEmailAddress;
// 		res = new DummyRes(200, 0, '103:EMAIL_SENT');

// 		// name, password, email (good)
// 		return myPromise(routePostRegister, [req, res])
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePostRegister #11a failed\n'}

// 		return getUser({userName: 'testb.dummy.1'});
// 	})
// 	.then((returned) => {

// 		user = returned;
// 		req.body.token = nonceToken;
// 		res = new DummyRes(400, 1001, '1001:ERROR_DATA');

// 		// name, password, email, token (incorrect)
// 		return myPromise(routePutRegister, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePutRegister #12 failed\n'}

// 		delete req.body.name;
// 		delete req.body.password;
// 		delete req.body.email;
// 		res = new DummyRes(400, 1002, '1002:ERROR_DATA_VALIDATION');

// 		// token
// 		return myPromise(routePutRegister, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePutRegister #13 failed\n'}

// 		req.body.user = firstEmailAddress;
// 		res = new DummyRes(403, 1004, '1004:ERROR_TOKEN');

// 		// token, user
// 		return myPromise(routePutRegister, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePutRegister #14 failed\n'}

// 		return createToken(testBToken1, 'testb.dummy.1');
// 	})
// 	.then(() => {

// 		req.body.token = testBToken1;
// 		res = new DummyRes(201, 0, '104:OK_REGISTER');

// 		// token, user
// 		return myPromise(routePutRegister, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePutRegister #15 failed\n'}

// 		req.body.password = 'mypassword';
// 		req.body.user = secondEmailAddress;
// 		res = new DummyRes(400, 1001, '1001:ERROR_DATA');

// 		// token (stale and not required), user (wrong email), password
// 		return myPromise(routePutLogin, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePutLogin #16 failed\n'}

// 		delete req.body.token;
// 		res = new DummyRes(403, 3004, '3004:DB_ERROR_USER');

// 		// user (wrong email), password
// 		return myPromise(routePutLogin, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePutLogin #17 failed\n'}

// 		req.body.user = firstEmailAddress;
// 		res = new DummyRes(201, 0, '102:OK_AUTHORIZED');

// 		// user (correct email), password
// 		return myPromise(routePutLogin, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePutLogin #18 failed\n'}

// 		res = new DummyRes(400, 1001, '1001:ERROR_DATA');

// 		// user, password
// 		return myPromise(routePostRecover, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePostRecover #19 failed\n'}

// 		delete req.body.password;
// 		req.body.userName = user.userName;
// 		res = new DummyRes(200, 0, '103:EMAIL_SENT');

// 		// user, userName
// 		return myPromise(routePostRecover, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePostRecover #20 failed\n'}

// 		return getUser({userName: 'testb.dummy.1'});
// 	})
// 	.then((returned) => {

// 		user = returned;

// 		delete req.body.userName
// 		req.body.password = 'mynewpassword';
// 		req.body.token = nonceToken;
// 		res = new DummyRes(403, 1003, '1003:ERROR_LOGIN');

// 		// user, password, token (bad)
// 		return myPromise(routePutRecover, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePutRecover #21 failed\n'}

// 		return createToken(testBToken2, 'testb.dummy.1');
// 	})
// 	.then(() => {

// 		req.body.token = testBToken2;
// 		res = new DummyRes(201, 0, '102:OK_AUTHORIZED');

// 		// user, password, token (good)
// 		return myPromise(routePutRecover, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePutRecover #22 failed\n'}

// 		delete req.body.user;
// 		delete req.body.password;
// 		delete req.body.token;

// 		req.body.userName = 'testb.dummy.1';
// 		req.body.email = secondEmailAddress;
// 		req.token = {token: currentPacket.token};
// 		req.verifiedToken = vt;
// 		req.user = user;
// 		res = new DummyRes(201, 0, '108:OK_UPDATED_EMAIL_WARNING');

// 		// userName, email
// 		return myPromise(routePutUser, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePutUser #23 failed\n'}

// 		return getUser({userName: 'testb.dummy.1'});
// 	})
// 	.then((returned) => {

// 		user = returned;

// 		req.body.token = nonceToken;
// 		req.token = null;
// 		req.verifiedToken = null;
// 		req.user = null;

// 		res = new DummyRes(400, 1001, '1001:ERROR_DATA');

// 		// userName, email, token (incorrect)
// 		return myPromise(routePutConfirmEmail, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePutConfirmEmail #24 failed\n'}

// 		delete req.body.userName;
// 		delete req.body.email;
// 		req.body.user = secondEmailAddress;
// 		res = new DummyRes(403, 3004, '3004:DB_ERROR_USER');

// 		// token (incorrect), user
// 		return myPromise(routePutConfirmEmail, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePutConfirmEmail #25 failed\n'}

// 		return createToken(testBToken3, 'testb.dummy.1');
// 	})
// 	.then(() => {

// 		req.body.token = testBToken3;
// 		res = new DummyRes(201, 0, '109:OK_EMAIL_UPDATED');

// 		// token (good), user
// 		return myPromise(routePutConfirmEmail, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePutConfirmEmail #26 failed\n'}

// 		delete req.body.user;
// 		delete req.body.token;

// 		req.body.userName = 'testb.dummy.1';
// 		req.body.email = '';
// 		req.token = {token: currentPacket.token};
// 		req.verifiedToken = vt;
// 		req.user = user;

// 		res = new DummyRes(201, 0, '107:OK_DELETED_EMAIL_WARNING');

// 		// userName, email (0-string)
// 		return myPromise(routePutUser, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePutUser #27 failed\n'}

// 		if(msg.length) throw msg;

// 		return deleteUserByNameAction('testb.dummy.1');
// 	})
// 	// .then((res) => console.log((res) ? 'testb.dummy.1 deleted' : 'Database cleanup required for testb.dummy.1'))
// 	.then((res) => {})
// 	.catch((err) => {

// 		console.log(`v1URouter-02 errors:\n${err}`);
// 		deleteUserByNameAction('testb.dummy.1');
// 		expect(err).toBeFalsy();
// 	});
// });


// 1. POST /register - correct data
// 2. PUT /login - too much data
// 3. PUT /login - missing data
// 4. PUT /login - bad data
// 5. PUT /login - correct data
// 6. PUT /user - too much data
// 7. PUT /user - missing data
// 8. PUT /user - bad data
// 9. PUT /user - correct data
// 10. GET /token - too much data
// 11. GET /token - missing data
// 12. GET /token - bad data
// 13. GET /token - correct data
// 14. GET /twofa - too much data
// 15. GET /twofa - missing data
// 16. GET /twofa - bad data
// 17. GET /twofa - correct data
// 18. POST /twofa - too much data
// 19. POST /twofa - missing data
// 20. POST /twofa - bad data
// 21. POST /twofa - correct data
// 22. PUT /twofa - already logged in
// 22. PUT /twofa - too much data
// 23. PUT /twofa - missing data
// 24. PUT /twofa - bad data
// 25. PUT /twofa - correct data - no immediately prior login
// 26. PUT /login - correct data
// 27. PUT /twofa - correct data - with prior login
test('v1URouter-03 - PUT/login, PUT/user, GET/token, GET/twofa, POST/twofa, PUT/twofa', () => {

	let msg = '',
		user;

	let vt = {
		expires: '2040-01-01T00:00:00',
		data: {
			userName: 'testc.dummy.1'
		}
	};

	flag = true;

	let req = new DummyReq();
	req.body.name = 'TestC Dummy';
	req.body.password = 'mypassword';
	req.body.locale = 'xp';
	let res = new DummyRes(201, 0, '104:OK_REGISTER');

	// name, password
	return myPromise(routePostRegister, [req, res])
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routePostRegister #28 failed\n'}

		res = new DummyRes(400, 1001, '1001:ERROR_DATA');

		// name, password, locale
		return myPromise(routePutLogin, [req, res]);
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routePutLogin #29 failed\n'}

		delete req.body.name;
		res = new DummyRes(400, 1002, '1002:ERROR_DATA_VALIDATION');

		// password, locale
		return myPromise(routePutLogin, [req, res]);
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routePutLogin #30 failed\n'}

		req.body.user = 'testc.dummy.1';
		req.body.password = 'mybadpassword';
		res = new DummyRes(401, 1003, '1003:ERROR_LOGIN');

		// password (wrong), user, locale
		return myPromise(routePutLogin, [req, res]);
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routePutLogin #31 failed\n'}

		req.body.password = 'mypassword';
		res = new DummyRes(201, 0, '102:OK_AUTHORIZED');

		// password (correct), user, locale
		return myPromise(routePutLogin, [req, res]);
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routePutLogin #32 failed\n'}

		return getUser({userName: 'testc.dummy.1'});
	})
	.then((returned) => {

		user = returned;
		req.user = user;
		req.token = {token: currentPacket.token};
		req.verifiedToken = vt;

		delete req.body.user;
		delete req.body.locale;
		req.body.name = 'TestC Dummy changed';
		req.body.password = 'mypasswordchanged';
		req.body.recoveryPhrase = 'This is my adequately long recovery phrase';
		req.body.twofaIsEnabled = true;
		req.body.cat = 'Jojo';

		res = new DummyRes(400, 1002, '1002:ERROR_DATA_VALIDATION');

		// name, password, recoveryPhrase, twofaIsEnabled, cat
		return myPromise(routePutUser, [req, res]);
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routePutUser #33 failed\n'}

		delete req.body.cat;
		res = new DummyRes(400, 1002, '1002:ERROR_DATA_VALIDATION');

		// name, password, recoveryPhrase, twofaIsEnabled
		return myPromise(routePutUser, [req, res]);
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routePutUser #34 failed\n'}

		req.body.userName = 'testc.dummy.1';
		res = new DummyRes(201, 0, '106:OK_USER_UPDATED');

		// name, password, recoveryPhrase, twofaIsEnabled, userName
		return myPromise(routePutUser, [req, res]);
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routePutUser #35 failed\n'}

		res = new DummyRes(400, 1001, '1001:ERROR_DATA');

		// name, password, recoveryPhrase, twofaIsEnabled, userName
		return myPromise(routeGetToken, [req, res]);
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routeGetToken #36 failed\n'}

		req.body = {};
		res = new DummyRes(400, 1002, '1002:ERROR_DATA_VALIDATION');

		// [no attributes set]
		return myPromise(routeGetToken, [req, res]);
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routeGetToken #37 failed\n'}

		req.body.userName = 'testc.dummy.2';
		res = new DummyRes(400, 1002, '1002:ERROR_DATA_VALIDATION');

		// userName
		return myPromise(routeGetToken, [req, res]);
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routeGetToken #38 failed\n'}

		req.body.userName = 'testc.dummy.1';
		res = new DummyRes(201, 0, '112:OK_TOKEN_REFRESHED');

		// userName
		return myPromise(routeGetToken, [req, res]);
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routeGetToken #39 failed\n'}

		delete req.body.userName;
		req.body.name = 'somename';
		res = new DummyRes(400, 1002, '1002:ERROR_DATA_VALIDATION');

		// name
		return myPromise(routeGetTwofa, [req, res]);
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routeGetTwofa #40 failed\n'}

		req.body = {};
		res = new DummyRes(400, 1002, '1002:ERROR_DATA_VALIDATION');

		// [no attributes set]
		return myPromise(routeGetTwofa, [req, res]);
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routeGetTwofa #41 failed\n'}

		req.body.userName = 'testc.dummy.2';
		res = new DummyRes(400, 1002, '1002:ERROR_DATA_VALIDATION');

		// username
		return myPromise(routeGetTwofa, [req, res]);
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routeGetTwofa #42 failed\n'}

		req.body.userName = 'testc.dummy.1';
		res = new DummyRes(201, 0, '110:OK_2FA_DATA');

		// username
		return myPromise(routeGetTwofa, [req, res]);
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routeGetTwofa #43 failed\n'}

		delete req.body.userName;
		req.body.name = 'somename';
		res = new DummyRes(400, 1002, '1002:ERROR_DATA_VALIDATION');

		// name
		return myPromise(routePostTwofa, [req, res]);
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routePostTwofa #44 failed\n'}

		delete req.body.name;
		req.body.userName = 'testc.dummy.1';
		res = new DummyRes(400, 1002, '1002:ERROR_DATA_VALIDATION');

		// userName
		return myPromise(routePostTwofa, [req, res]);
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routePostTwofa #45 failed\n'}

		req.body.token = '000000';
		res = new DummyRes(400, 1004, '1004:ERROR_TOKEN');

		// userName, token (bad)
		return myPromise(routePostTwofa, [req, res]);
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routePostTwofa #46 failed\n'}

		return generateTwofaToken(user.secrets.twofaCode);
	})
	.then((returned) => {

		req.body.token = returned;
		res = new DummyRes(200, 0, '101:OK_BASIC');

		// userName, token (good)
		return myPromise(routePostTwofa, [req, res]);
	})
	.then((res) => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routePostTwofa #47 failed\n'}

		return generateTwofaToken(user.twofaCode);
	})
	.then((returned) => {

		req.body.token = returned;
		res = new DummyRes(409, 1008, '1008:ERROR_DUPLICATE_LOGIN');

		// userName, token (good)
		return myPromise(routePutTwofa, [req, res]);
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routePutTwofa #48 failed\n'}

		req.token = null;
		req.verifiedToken = null;

		delete req.body.userName;
		delete req.body.token;
		req.body.name = 'somename';
		res = new DummyRes(400, 1001, '1001:ERROR_DATA');

		// name
		return myPromise(routePutTwofa, [req, res]);
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routePutTwofa #49 failed\n'}

		delete req.body.name;
		req.body.userName = 'testc.dummy.1';
		res = new DummyRes(400, 1002, '1002:ERROR_DATA_VALIDATION');

		// userName
		return myPromise(routePutTwofa, [req, res]);
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routePutTwofa #50 failed\n'}

		req.body.token = '000000';
		res = new DummyRes(401, 1017, '1017:ERROR_TWOFA_CLOSED');

		// userName, token (bad)
		return myPromise(routePutTwofa, [req, res]);
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routePutTwofa #51 failed\n'}

		return generateTwofaToken(user.secrets.twofaCode);
	})
	.then((returned) => {

		req.body.token = returned;
		res = new DummyRes(401, 1017, '1017:ERROR_TWOFA_CLOSED');

		// userName, token (good)
		return myPromise(routePutTwofa, [req, res]);
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routePutTwofa #52 failed\n'}

		req.user = null;
		req.body = {
			user: 'testc.dummy.1',
			password: 'mypasswordchanged'
		};
		res = new DummyRes(200, 0, '111:OK_2FA_LOGIN');

		// userName, token (bad)
		return myPromise(routePutLogin, [req, res]);
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routePutLogin #53 failed\n'}

		return getUser({userName: 'testc.dummy.1'});
	})
	.then((returned) => {

		user = returned;
		req.user = user;
		return generateTwofaToken(user.secrets.twofaCode);
	})
	.then((returned) => {

		req.body = {
			userName: 'testc.dummy.1',
			token: returned
		};
		res = new DummyRes(201, 0, '102:OK_AUTHORIZED');

		// userName, token (good)
		return myPromise(routePutTwofa, [req, res]);
	})
	.then(() => {

		try{
			expect(flag).toBeTruthy();
		} catch(e){ flag = true; msg += 'routePutTwofa #54 failed\n'}

		if(msg.length) throw msg;

		return deleteUserByNameAction('testc.dummy.1');
	})
	// .then((res) => console.log((res) ? 'testc.dummy.1 deleted' : 'Database cleanup required for testc.dummy.1'))
	.then((res) => {})
	.catch((err) => {

		console.log(`v1URouter-03 errors:\n${err}`);
		deleteUserByNameAction('testc.dummy.1');
		expect(err).toBeFalsy();
	});
});
