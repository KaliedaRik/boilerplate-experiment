// NOTE - THESE TESTS WILL FAIL IF THE ARANGOdb SERVER IS NOT RUNNING

// If running email tests, update email addresses here
const firstEmailAddress = 'hello@rikworks.co.uk',  	// HARDCODED DATA that needs to be separated out into a Z- file
	secondEmailAddress = 'rik.roots@gmail.com';  	// HARDCODED DATA that needs to be separated out into a Z- file

process.env.MYENVIRONMENT = 'dev';

const { postRegister } = require('./v1-user-actions.js');

const { 
	deleteUserByNameAction,
	getUser } = require('./v1-database.js');

const { 
	routeGetRoot, 			// TEST TO BE WRITTEN
	routePostArchive,		// TEST TO BE WRITTEN
	routePutArchive,		// TEST TO BE WRITTEN
	routeDeleteUser } = require('./v1-archive-router.js'); 	// TEST TO BE WRITTEN (email); TEST TO BE WRITTEN (no email)

const { 
	routePutLogin,
	routePostRegister,
	routePutUser } = require('./v1-user-router.js');

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

test('v1ArchRouter-01', () => {
	expect(true).toBeTruthy();
});


// 1. POST /register - correct data (self - the main user)
// 2. POST /register - correct data (user 2)
// 3. PUT /archive - too much data (user 2)
// 4. PUT /archive - missing data (user 2)
// 5. PUT /archive - bad data (user 2)
// 6. PUT /archive - correct data (user 2)
// 7. PUT /archive - bad data (self)
// 8. PUT /archive - correct data (self)
// 9. POST /archive - correct data - user still logged in (self)
// 10. PUT /login - correct data - user archived (self)
// 11. POST /archive - too much data (self)
// 12. POST /archive - bad data (self)
// 13. POST /archive - correct data (self)
// 14. POST /archive - correct data - user not archived (self)
// 15. DELETE /user - too much data (user 2)
// 16. DELETE /user - missing data (user 2)
// 17. DELETE /user - bad data (user 2)
// 18. DELETE /user - correct data (user 2)
// 19. DELETE /user - bad data (self)
// 20. DELETE /user - correct data (self)
// test('v1ARouter-01 - PUT/archive, POST/archive, DELETE/user', () => {
// 	let msg = '',
// 		selfUser, otherUser, apiSelfUser;

// 	let vt = {
// 		expires: '2040-01-01T00:00:00',
// 		data: {
// 			userName: 'testd.dummy.1'
// 		}
// 	};

// 	flag = true;

// 	let req = new DummyReq();
// 	req.body.name = 'TestD Dummy';
// 	req.body.password = 'mypassword';
// 	let res = new DummyRes(201, 0, '104:OK_REGISTER');

// 	// name, password
// 	return myPromise(routePostRegister, [req, res])
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePostRegister #55 failed\n'}

// 		selfUser = JSON.parse(JSON.stringify(currentPacket));
// 		res = new DummyRes(201, 0, '104:OK_REGISTER');

// 		// name, password
// 		return myPromise(routePostRegister, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePostRegister #56 failed\n'}

// 		otherUser = JSON.parse(JSON.stringify(currentPacket));

// 		return getUser({userName: 'testd.dummy.1'});
// 	})
// 	.then((returned) => {

// 		apiSelfUser = returned;
// 		req.user = apiSelfUser;
// 		req.token = {token: selfUser.token};
// 		req.verifiedToken = vt;

// 		res = new DummyRes(400, 1001, '1001:ERROR_DATA');

// 		// name, password
// 		return myPromise(routePutArchive, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePutArchive #57 failed\n'}

// 		req.body = {
// 			key: otherUser.key,
// 			userName: selfUser.userName
// 		}

// 		res = new DummyRes(400, 1002, '1002:ERROR_DATA_VALIDATION');

// 		// key, userName
// 		return myPromise(routePutArchive, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePutArchive #58 failed\n'}

// 		req.body.userIsSelf = true;
// 		res = new DummyRes(400, 1011, '1011:ERROR_ARCHIVE_MISMATCH');

// 		// key, userName, userIsSelf (mismatch)
// 		return myPromise(routePutArchive, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePutArchive #59 failed\n'}

// 		req.body.userIsSelf = false;
// 		res = new DummyRes(200, 0, '601:OK_USER_ARCHIVED');

// 		// key, userName, userIsSelf (good)
// 		return myPromise(routePutArchive, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePutArchive #60 failed\n'}

// 		req.body.key = selfUser.key;
// 		res = new DummyRes(400, 1011, '1011:ERROR_ARCHIVE_MISMATCH');

// 		// key, userName, userIsSelf (mismatch)
// 		return myPromise(routePutArchive, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePutArchive #61 failed\n'}

// 		req.body.userIsSelf = true;
// 		res = new DummyRes(200, 0, '601:OK_USER_ARCHIVED');

// 		// key, userName, userIsSelf (good)
// 		return myPromise(routePutArchive, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePutArchive #62 failed\n'}

// 		req.body = {
// 			user: 'testd.dummy.1',
// 			password: 'mypassword'
// 		};
// 		res = new DummyRes(409, 1008, '1008:ERROR_DUPLICATE_LOGIN');

// 		// user, password (still logged in)
// 		return myPromise(routePostArchive, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePostArchive #63 failed\n'}

// 		req.user = null;
// 		req.token = null;
// 		req.verifiedToken = null;
// 		res = new DummyRes(403, 1013, '1013:ERROR_LOGIN_ARCHIVED');

// 		// user, password (should fail because user is archived)
// 		return myPromise(routePutLogin, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePutLogin #64 failed\n'}

// 		req.body.cat = 'Jojo';
// 		res = new DummyRes(400, 1001, '1001:ERROR_DATA');

// 		// user, password, cat
// 		return myPromise(routePostArchive, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePostArchive #65 failed\n'}

// 		delete req.body.cat;
// 		req.body.password = 'mybadpassword';
// 		res = new DummyRes(401, 1003, '1003:ERROR_LOGIN');

// 		// user, password (wrong)
// 		return myPromise(routePostArchive, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePostArchive #66 failed\n'}

// 		req.body.password = 'mypassword';
// 		res = new DummyRes(201, 0, '602:OK_USER_UNARCHIVED');

// 		// user, password (correct)
// 		return myPromise(routePostArchive, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePostArchive #67 failed\n'}

// 		req.body.password = 'mypassword';
// 		res = new DummyRes(401, 1014, '1014:ERROR_LOGIN_UNARCHIVED');

// 		// user, password (correct)
// 		return myPromise(routePostArchive, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routePostArchive #68 failed\n'}

// 		res = new DummyRes(403, 1004, '1004:ERROR_TOKEN');

// 		// name, password (no auth token etc)
// 		return myPromise(routeDeleteUser, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routeDeleteUser #69 failed\n'}

// 		req.body = {
// 			key: otherUser.key,
// 			userName: selfUser.userName
// 		}

// 		req.user = apiSelfUser;
// 		req.token = {token: selfUser.token};
// 		req.verifiedToken = vt;

// 		res = new DummyRes(400, 1002, '1002:ERROR_DATA_VALIDATION');

// 		// key, userName
// 		return myPromise(routeDeleteUser, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routeDeleteUser #70 failed\n'}

// 		req.body.userIsSelf = true;
// 		res = new DummyRes(400, 1015, '1015:ERROR_DELETE_MISMATCH');

// 		// key, userName, userIsSelf (mismatch)
// 		return myPromise(routeDeleteUser, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routeDeleteUser #71 failed\n'}

// 		req.body.userIsSelf = false;
// 		res = new DummyRes(200, 0, '603:OK_USER_DELETED');

// 		// key, userName, userIsSelf (good) - deleting otherUser
// 		return myPromise(routeDeleteUser, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routeDeleteUser #72 failed\n'}

// 		req.body.key = selfUser.key;
// 		res = new DummyRes(400, 1015, '1015:ERROR_DELETE_MISMATCH');

// 		// key, userName, userIsSelf (mismatch)
// 		return myPromise(routeDeleteUser, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routeDeleteUser #73 failed\n'}

// 		req.body.userIsSelf = true;
// 		res = new DummyRes(200, 0, '603:OK_USER_DELETED');

// 		// key, userName, userIsSelf (good) - deleting self
// 		return myPromise(routeDeleteUser, [req, res]);
// 	})
// 	.then(() => {

// 		try{
// 			expect(flag).toBeTruthy();
// 		} catch(e){ flag = true; msg += 'routeDeleteUser #74 failed\n'}

// 		if(msg.length) throw msg;

// 		// deleteUserByNameAction('testd.dummy.1');
// 		// deleteUserByNameAction('testd.dummy.2');
// 	})
// 	.catch((err) => {

// 		console.log(`v1ARouter-01 errors:\n${err}`);
// 		deleteUserByNameAction('testd.dummy.1');
// 		deleteUserByNameAction('testd.dummy.2');
// 		expect(err).toBeFalsy();
// 	});
// });
