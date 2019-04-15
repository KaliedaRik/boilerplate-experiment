// NOTE - THESE TESTS WILL FAIL IF THE ARANGOdb SERVER IS NOT RUNNING

// If running email tests, update email address here
const emailAddress = 'hello@rikworks.co.uk'; 			// THIS NEEDS TO BE TRANSFERRED to a z- env file

process.env.MYENVIRONMENT = 'dev';

const moment = require('moment');

const { 
	deleteUserByNameAction,
	createToken,
	getUser } = require('./v1-database.js');

const { 
	actionPostRegister,
	actionPutRegister,
	actionPutLogin,
	actionPostRecover,
	actionPutConfirmEmail,
	actionPutRecover,
	actionPutTwofa,
	actionPostTwofa,
	actionGetToken,
	actionPutUserAuth,
	actionPutUser } = require('./v1-user-actions.js');

const { generateTwofaToken } = require('./utilities.js');


test('v1UAction-01 will register, login (fail and pass), and delete new test user (no email supplied)', () => {

	let msg = '';

	let testData = {
		name: 'My Action1 Test User',
		password: 'mypassword',
		locale: 'xp'
	};

	return actionPostRegister(testData)
	.then((res) => {

		try{
			expect(res.data.key.length).toBeGreaterThan(0);
			expect(res.data.name).toBe('My Action1 Test User');
			expect(res.data.userName).toBe('my.action1.test.user.1');
			expect(res.data.recoveryPhrase).toBeUndefined();
			expect(res.data.email).toBeUndefined();
			expect(res.data.locale).toBe('xp');
			expect(res.data.password).toBeUndefined();
			expect(res.data.hash).toBeUndefined();
			expect(res.data.token.length).toBeGreaterThan(0);
			expect(res.data.twofaIsEnabled).toBeFalsy();
			expect(res.data.twofaCode).toBeUndefined();
			expect(res.data.twofaImage).toBeUndefined();
			expect(res.data.isAdministrator).toBeTruthy();
			expect(res.data.canArchiveOtherUsers).toBeFalsy();
			expect(res.data.canDeleteOtherUsers).toBeFalsy();
			expect(moment(res.data.tokenExpires).unix()).toBeGreaterThan(moment().unix());
			expect(res.resultCode).toBe('104:OK_REGISTER');
		} catch(e) { msg += 'postRegister failed #1\n' }

		return actionPutLogin({user: 'my.action1.test.user.1', password: 'mywrongpassword'});
	})
	.then((res) => {
		// code should throw an error before reaching this point
		msg += 'putLogin resolved instead of rejecting #2\n';
		return actionPutLogin({user: 'my.action1.test.user.1', password: 'mypassword'});
	})
	.catch((res) => {

		try{
			expect(res.resultCode).toBe('1003:ERROR_LOGIN');
		} catch(e) { msg += 'putLogin failed #3\n' }

		return actionPutLogin({user: 'my.action1.test.user.1', password: 'mypassword'});
	})
	.then((res) => {

		try{
			expect(res.data.key.length).toBeGreaterThan(0);
			expect(res.data.userName).toBe('my.action1.test.user.1');
			expect(moment(res.data.tokenExpires).unix()).toBeGreaterThan(moment().unix());
			expect(res.resultCode).toBe('102:OK_AUTHORIZED');
		} catch(e) { msg += 'putLogin failed #4\n' }

		if(msg.length) throw msg;

		return deleteUserByNameAction('my.action1.test.user.1');
	})
	// .then((res) => console.log((res) ? 'my.action1.test.user.1 deleted' : 'Database cleanup required for my.action1.test.user.1'))
	.then((res) => {})
	.catch((err) => {

		console.log(`v1UAction-01 errors:\n${err}`);
		deleteUserByNameAction('my.action1.test.user.1');
		return expect(err).toBeFalsy();
	});
});


test('v1UAction-02 will attempt to register new test user with bad email address', () => {

	let msg = '';

	let testData = {
		name: 'My Action2 Test User',
		password: 'mypassword',
		email: 'test@thisisaxxxxxnonsensicalemailxxxxxaddress.com',
		locale: 'xp'
	};

	return actionPostRegister(testData)
	.then((res) => {
		// code should throw an error before reaching this point
		msg += 'actionPostRegister resolved instead of rejecting #5\n';

		return true;
	})
	.catch((res) => {

		try{
			expect(res.resultCode).toBe('1006:ERROR_EMAIL_BAD');
		} catch(e) { msg += 'actionPostRegister failed to catch bad email #6\n' }

		return true;
	})
	.then((res) => {

		if(msg.length) throw msg;
		return true;
	})
	.catch((err) => {

		console.log(`v1UAction-02 errors:\n${err}`);
		deleteUserByNameAction('my.action2.test.user.1');
		return expect(err).toBeFalsy();
	});
});


// UNCOMMENT TO TEST REGISTRATION EMAIL FUNCTIONALITY
// - test may fail if email-related tests are also being conducted in v1-user-router.test.js with the same email addresses

// test('v1UAction-03 will register user with email address (generates email!), verify, and delete user', () => {

// 	let msg = '';

// 	let testData = {
// 		name: 'My Action3 Test User',
// 		password: 'mypassword',
// 		email: emailAddress,
// 		locale: 'xp'
// 	};

// 	let user;

// 	return actionPostRegister(testData)
// 	.then((res) => {

// 		try{
// 			expect(res.resultCode).toBe('103:EMAIL_SENT');
// 			expect(res.data).toBeUndefined();
// 		} catch(e) { msg += 'actionPostRegister failed #7\n' }

// 		return getUser({email: emailAddress});
// 	})
// 	.then((res) => {

// 		try{
// 			expect(res.user._key.length).toBeGreaterThan(0);
// 			expect(res.user.name).toBe('My Action3 Test User');
// 			expect(res.user.email).toBe(emailAddress);
// 		} catch(e) { msg += 'getUser failed #8\n' }

// 		user = res;
// 		return createToken('action3testUserToken', 'my.action3.test.user.1');
// 	})
// 	.then((res) => actionPutRegister({user: 'my.action3.test.user.1', token: 'action3testUserToken'}))
// 	.then((res) => {

// 		try{
// 			expect(res.data.userName).toBe('my.action3.test.user.1');
// 		} catch(e) { msg += 'actionPutRegister failed #9\n' }

// 		return getUser({email: emailAddress});
// 	})
// 	.then((res) => {

// 		try{
// 			expect(res.user._key.length).toBeGreaterThan(0);
// 			expect(res.user.name).toBe('My Action3 Test User');
// 			expect(res.user.email).toBe(emailAddress);
// 		} catch(e) { msg += 'getUser failed #10\n' }

// 		return actionPostRegister(testData);
// 	})
// 	.then((res) => {

// 		msg += 'actionPostRegister resolved instead of rejecting #11\n';
// 		return true;
// 	})
// 	.catch((res) => {

// 		try{
// 			expect(res.resultCode).toBe('1007:ERROR_DUPLICATE_USER');
// 		} catch(e) { msg += 'actionPostRegister failed #12\n' }

// 		if(msg.length) throw msg;

// 		return deleteUserByNameAction('my.action3.test.user.1');
// 	})
//	// .then((res) => console.log((res) ? 'my.action3.test.user.1 deleted' : 'Database cleanup required for my.action3.test.user.1'))
//	.then((res) => {})
// 	.catch((err) => {

// 		console.log(`v1UAction-03 errors:\n${err}`);
// 		deleteUserByNameAction('my.action3.test.user.1');
// 		return expect(err).toBeFalsy();
// 	});
// });


test('v1UAction-04 will register user (no email), request password recovery, action it, and delete user', () => {

	let msg = '';

	let testData = {
		name: 'My Action4 Test User',
		password: 'mypassword',
		recoveryPhrase: 'myrecoveryphrase',
		locale: 'en'
	};

	let key, originalHash, updatedHash;

	return actionPostRegister(testData)
	.then((res) => {

		key = res.data.key;
		return getUser({key: key});
	})
	.then((res) => {

		originalHash = res.secrets.hash;

		try{
			expect(res.user.userName).toBe('my.action4.test.user.1');
		} catch(e) { msg += 'getUser failed #13\n' }

		return actionPostRecover({
			phrase: 'myrecoveryphrase',
			user: 'my.action4.test.user.1'
		});
	})
	.then((res) => {

		try{
			expect(res.resultCode).toBe('105:OK_RECOVER');
			expect(res.data.token.length).toBeGreaterThan(0);
		} catch(e) { msg += 'actionPostRecover failed #14\n' }

		return actionPutRecover({password: 'mynewpassword', token: res.data.token});
	})
	.then((res) => getUser({key: key}))
	.then((res) => {

		updatedHash = res.secrets.hash;

		try{
			expect(res.user.userName).toBe('my.action4.test.user.1');
			expect(updatedHash).not.toBe(originalHash);
		} catch(e) { msg += 'actionPutRegister failed #15\n' }

		if(msg.length) throw msg;

		return deleteUserByNameAction('my.action4.test.user.1');
	})
	// .then((res) => console.log((res) ? 'my.action4.test.user.1 deleted' : 'Database cleanup required for my.action4.test.user.1'))
	.then((res) => {})
	.catch((err) => {

		console.log(`v1UAction-04 errors:\n${err}`);
		deleteUserByNameAction('my.action4.test.user.1');
		return expect(err).toBeFalsy();
	});
});


// UNCOMMENT TO TEST REGISTRATION EMAIL FUNCTIONALITY
// - test may fail if email-related tests are also being conducted in v1-user-router.test.js with the same email addresses

// test('v1UAction-05 will register user with email address (generates email!), request password recovery, action it, and delete user', () => {

// 	let msg = '';

// 	let testData = {
// 		name: 'My Action5 Test User',
// 		password: 'mypassword',
// 		recoveryPhrase: 'myrecoveryphrase',
// 		email: emailAddress,
// 		locale: 'xp'
// 	};

// 	let originalHash, updatedHash;

// 	return actionPostRegister(testData)
// 	.then((res) => {

// 		try{
// 			expect(res.resultCode).toBe('103:EMAIL_SENT');
// 			expect(res.data).toBeUndefined();
// 		} catch(e) { msg += 'actionPostRegister failed #16\n' }

// 		return getUser({email: emailAddress});
// 	})
// 	.then((res) => {

// 		originalHash = res.secrets.hash;

// 		try{
// 			expect(res.user._key.length).toBeGreaterThan(0);
// 			expect(res.user.userName).toBe('my.action5.test.user.1');
// 		} catch(e) { msg += 'getUser failed #17\n' }

// 		return actionPostRecover({
// 			user: emailAddress
// 		});
// 	})
// 	.then((res) => {

// 		try{
// 			expect(res.resultCode).toBe('103:EMAIL_SENT');
// 		} catch(e) { msg += 'actionPostRecover failed #18\n' }

// 		return createToken('action5testUserToken', 'my.action5.test.user.1');
// 	})
// 	.then((res) => actionPutRecover({
// 		password: 'mynewpassword', 
// 		token: 'action5testUserToken'
// 	}))
// 	.then((res) => {

// 		try{
// 			expect(res.resultCode).toBe('113:OK_PASSWORD');
// 			expect(res.data.userName).toBe('my.action5.test.user.1');
// 		} catch(e) { msg += 'actionPutRecover failed #19\n' }

// 		return getUser({email: emailAddress});
// 	})
// 	.then((res) => {

// 		updatedHash = res.secrets.hash;

// 		try{
// 			expect(res.user._key.length).toBeGreaterThan(0);
// 			expect(res.user.name).toBe('My Action5 Test User');
// 			expect(res.user.email).toBe(emailAddress);
// 			expect(updatedHash).not.toBe(originalHash);
// 		} catch(e) { msg += 'getUser failed #20\n' }

// 		if(msg.length) throw msg;
// 		return deleteUserByNameAction('my.action5.test.user.1');
// 	})
//	// .then((res) => console.log((res) ? 'my.action5.test.user.1 deleted' : 'Database cleanup required for my.action5.test.user.1'))
//	.then((res) => {})
// 	.catch((err) => {

// 		console.log(`v1UAction-05 errors:\n${err}`);
// 		deleteUserByNameAction('my.action5.test.user.1');
// 		return expect(err).toBeFalsy();
// 	});
// });


test('v1UAction-06 will register user, update some details, and delete user', () => {

	let msg = '';

	let testData = {
		name: 'My Action6 Test User',
		password: 'mypassword',
		recoveryPhrase: 'myrecoveryphrase',
		isAdministrator: true,
		locale: 'en'
	};

	let updateData = {
		name: 'My ActUPDATEDion6 Test User',
		password: 'mypaUPDATEDssword',
		recoveryPhrase: 'myreUPDATEDcoveryphrase',
		locale: 'xp',
		cat: 'Jojo',
		canArchiveOtherUsers: true,
		address: '1 Westminster\nSW1A 0AA',
		hash: 'this should never appear'
	};

	let updatePermissions;

	let key, registerRes, registerUser, updatedRes, updatedUser;

	return actionPostRegister(testData)
	.then((res) => {

		registeredRes = res;
		key = registeredRes.data.key;

		try{
			expect(registeredRes.resultCode).toBe('104:OK_REGISTER');
			expect(registeredRes.data.userName).toBe('my.action6.test.user.1');
			expect(registeredRes.data.name).toBe('My Action6 Test User');
			expect(registeredRes.data.password).toBeUndefined();
			expect(registeredRes.data.hash).toBeUndefined();
			expect(registeredRes.data.recoveryPhrase).toBeUndefined();
			expect(registeredRes.data.recoveryHash).toBeUndefined();
			expect(registeredRes.data.email).toBeUndefined();
			expect(registeredRes.data.newEmail).toBeUndefined();
			expect(registeredRes.data.locale).toBe('en');
			expect(registeredRes.data.isAdministrator).toBeTruthy();
			expect(registeredRes.data.canArchiveOtherUsers).toBeFalsy();
			expect(registeredRes.data.token.length).toBeGreaterThan(0);
			expect(moment(registeredRes.data.tokenExpires).unix()).toBeGreaterThan(moment().unix());
		} catch(e) { msg += 'actionPostRegister failed #21\n' }

		return getUser({key: key});
	})
	.then((res) => {

		registerUser = res;

		try{
			expect(registerUser.user.userName).toBe('my.action6.test.user.1');
			expect(registerUser.secrets.password).toBeUndefined();
			expect(registerUser.secrets.hash).toBeDefined();
			expect(registerUser.secrets.recoveryPhrase).toBeUndefined();
			expect(registerUser.secrets.recoveryHash).toBeDefined();
			expect(registerUser.auths.isAdministrator).toBeTruthy();
			expect(registerUser.auths.canArchiveOtherUsers).toBeFalsy();
			expect(registerUser.auths.canDeleteOtherUsers).toBeFalsy();
		} catch(e) { msg += 'getUser failed #22\n' }

		return actionPutUser(updateData, registerUser);
	})
	.then((res) => {

		updatedRes = res;

		try{
			expect(updatedRes.resultCode).toBe('106:OK_USER_UPDATED');
			expect(updatedRes.data.name).toBe('My ActUPDATEDion6 Test User');
			expect(updatedRes.data.userName).toBe('my.action6.test.user.1');
			expect(updatedRes.data.password).toBeUndefined();
			expect(updatedRes.data.hash).toBeUndefined();
			expect(updatedRes.data.recoveryPhrase).toBeUndefined();
			expect(updatedRes.data.recoveryHash).toBeUndefined();
			expect(updatedRes.data.cat).toBeUndefined();
			expect(updatedRes.data.address).toBeUndefined();
			expect(updatedRes.data.locale).toBe('xp');
			expect(updatedRes.data.token).toBeUndefined();
			expect(updatedRes.data.tokenExpires).toBeUndefined();
			expect(updatedRes.data.isAdministrator).toBeTruthy();
			expect(updatedRes.data.canArchiveOtherUsers).toBeFalsy();
		} catch(e) { msg += 'actionPutUser failed #23\n' }

		return getUser({key: key});
	})
	.then((res) => {

		updatedUser = res;

		try{
			expect(updatedUser.user.userName).toBe('my.action6.test.user.1');
			expect(updatedUser.secrets.password).toBeUndefined();
			expect(updatedUser.secrets.hash).toBeDefined();
			expect(updatedUser.secrets.hash).not.toEqual(registerUser.secrets.hash);
			expect(updatedUser.secrets.hash).not.toBe('mypaUPDATEDssword');
			expect(updatedUser.secrets.hash).not.toBe('this should never appear');
			expect(updatedUser.secrets.recoveryPhrase).toBeUndefined();
			expect(updatedUser.secrets.recoveryHash).toBeDefined();
			expect(updatedUser.secrets.recoveryHash).not.toEqual(registerUser.secrets.recoveryHash);
			expect(updatedUser.secrets.recoveryHash).not.toBe('myreUPDATEDcoveryphrase');
			expect(updatedUser.user.cat).toBe('Jojo');
			expect(updatedUser.user.address).toBe('1 Westminster\nSW1A 0AA');
			expect(updatedUser.auths.isAdministrator).toBeTruthy();
			expect(updatedUser.auths.canArchiveOtherUsers).toBeFalsy();
			expect(updatedUser.auths.canDeleteOtherUsers).toBeFalsy();
		} catch(e) { msg += 'getUser failed #24\n' }

		updatePermissions = {
			key: updatedUser.user._key,
			userName: updatedUser.user.userName,
			isAdministrator: false,
			canArchiveOtherUsers: true,
			cat: 'Toby',
		};

		return actionPutUserAuth(updatePermissions, updatedUser);
	})
	.then((res) => {

		msg += 'actionPutUserAuth failed to reject #24a\n'

		return getUser({key: key});
	})
	.catch((res) => {

		try{
			expect(res.resultCode).toBe('1019:ILLEGAL_ACTION');
		} catch(e) { msg += 'actionPutUserAuth failed #24a\n' }

		return getUser({key: key});
	})
	.then((res) => {

		try{
			expect(res.auths.isAdministrator).toBeTruthy();
			expect(res.user.cat).toBe('Jojo');
		} catch(e) { msg += 'getUser failed #24b\n' }

		updatePermissions = {
			key: updatedUser.user._key,
			userName: updatedUser.user.userName,
			canArchiveOtherUsers: true,
			cat: 'Toby',
		};

		return actionPutUserAuth(updatePermissions, updatedUser);
	})
	.then((res) => {

		try{
			expect(res.resultCode).toBe('106:OK_USER_UPDATED');
		} catch(e) { msg += 'actionPutUserAuth failed #24c\n' }

		return getUser({key: key});
	})
	.then((res) => {

		try{
			expect(res.auths.canArchiveOtherUsers).toBeTruthy();
			expect(res.user.cat).toBe('Jojo');
		} catch(e) { msg += 'getUser failed #24d\n' }

		if(msg.length) throw msg;
		return deleteUserByNameAction('my.action6.test.user.1');
	})
	// .then((res) => console.log((res) ? 'my.action6.test.user.1 deleted' : 'Database cleanup required for my.action6.test.user.1'))
	.then((res) => {})
	.catch((err) => {

		console.log(`v1UAction-06 errors:\n${err}`);
		deleteUserByNameAction('my.action6.test.user.1');
		return expect(err).toBeFalsy();
	});
});


// UNCOMMENT TO TEST REGISTRATION EMAIL FUNCTIONALITY
// - test may fail if email-related tests are also being conducted in v1-user-router.test.js with the same email addresses

// test('v1UAction-07 will register user, update and verify email changes, and delete user', () => {

// 	let msg = '';

// 	let testData = {
// 		name: 'My Action7 Test User',
// 		password: 'mypassword',
// 		locale: 'en'
// 	};

// 	let updateData = {
// 		locale: 'xp',
// 		email: emailAddress
// 	};

// 	let key, user, token = {};

// 	return actionPostRegister(testData)
// 	.then((res) => {

// 		try{
// 			expect(res.resultCode).toBe('104:OK_REGISTER');
// 			token.token = res.data.token;
// 			token.expires = res.data.tokenExpires;
// 			key = res.data.key;
// 		} catch(e) { msg += 'actionPostRegister failed #25\n' }

// 		return getUser({key: key});
// 	})
// 	.then((res) => {

// 		try{
// 			expect(res.user.userName).toBe('my.action7.test.user.1');
// 			expect(res.user.email).toBeNull();
// 			expect(res.user.newEmail).toBeUndefined();
// 		} catch(e) { msg += 'getUser failed #26\n' }

// 		return actionPutUser(updateData, res);
// 	})
// 	.then((res) => {

// 		try{
// 			expect(res.resultCode).toBe('108:OK_UPDATED_EMAIL_WARNING');
// 			expect(res.data.locale).toBe('xp');
// 			expect(res.data.hash).toBeUndefined();
// 			expect(res.data.email).toBeUndefined();
// 			expect(res.data.password).toBeUndefined();
// 			expect(res.data.recoveryPhrase).toBeUndefined();
// 			expect(res.data.twofaIsEnabled).toBeFalsy();
// 			expect(res.data.twofaCode).toBeUndefined();
// 			expect(res.data.twofaImage).toBeUndefined();
// 		} catch(e) { msg += 'actionPutUser failed #27\n' }

// 		return getUser({key: key});
// 	})
// 	.then((res) => {

// 		try{
// 			expect(res.user.userName).toBe('my.action7.test.user.1');
// 			expect(res.user.email).toBeNull();
// 			expect(res.user.newEmail).toBe(emailAddress);
// 		} catch(e) { msg += 'getUser failed #28\n' }

// 		return createToken('action7testUserToken', 'my.action7.test.user.1');
// 	})
// 	.then((res) => actionPutConfirmEmail({
// 		user: emailAddress,
// 		token: 'action7testUserToken'
// 	}))
// 	.then((res) => {

// 		try{
// 			expect(res.resultCode).toBe('102:OK_AUTHORIZED');
// 			expect(res.data.email).toBe(emailAddress);
// 		} catch(e) { msg += 'actionPutConfirmEmail failed #29\n' }

// 		return getUser({key: key});
// 	})
// 	.then((res) => {

// 		try{
// 			expect(res.user.userName).toBe('my.action7.test.user.1');
// 			expect(res.user.email).toBe(emailAddress);
// 			expect(res.user.newEmail).toBeUndefined();
// 		} catch(e) { msg += 'getUser failed #30\n' }

// 		return actionPutUser({ email: '' }, res);
// 	})
// 	.then((res) => {

// 		try{
// 			expect(res.resultCode).toBe('107:OK_DELETED_EMAIL_WARNING');
// 			expect(res.data.email).toBeUndefined();
// 		} catch(e) { msg += 'putUser failed #31\n' }

// 		if(msg.length) throw msg;

// 		return deleteUserByNameAction('my.action7.test.user.1');
// 	})
//	// .then((res) => console.log((res) ? 'my.action7.test.user.1 deleted' : 'Database cleanup required for my.action7.test.user.1'))
//	.then((res) => {})
// 	.catch((err) => {

// 		console.log(`v1UAction-07 errors:\n${err}`);
// 		deleteUserByNameAction('my.action7.test.user.1');
// 		return expect(err).toBeFalsy();
// 	});
// });


test('v1UAction-08 will register user, enable and test 2FA login, and delete user', () => {

	let msg = '';

	let testData = {
		name: 'My Action8 Test User',
		password: 'mypassword',
		recoveryPhrase: 'myrecoveryphrase',
		locale: 'en'
	};

	let updateData = {
		twofaIsEnabled: true,
	};

	let key, user, code,
		token = {};

	return actionPostRegister(testData)
	.then((res) => {

		try{
			expect(res.resultCode).toBe('104:OK_REGISTER');
			token.token = res.data.token;
			token.expires = res.data.tokenExpires;
			key = res.data.key;
		} catch(e) { msg += 'actionPostRegister failed #32\n' }

		return getUser({key: key});
	})
	.then((res) => {

		try{
			expect(res.user.userName).toBe('my.action8.test.user.1');
			code = res.secrets.twofaCode;
		} catch(e) { msg += 'getUser failed #33\n' }

		return actionPutUser(updateData, res);
	})
	.then((res) => {

		try{
			expect(res.resultCode).toBe('106:OK_USER_UPDATED');
			expect(res.data.twofaIsEnabled).toBeTruthy();
		} catch(e) { msg += 'putUser failed #34\n' }

		return actionPutLogin({user: 'my.action8.test.user.1', password: 'mypassword'});
	})
	.then((res) => {

		try{
			expect(res.data.key.length).toBeGreaterThan(0);
			expect(res.data.userName).toBe('my.action8.test.user.1');
			expect(res.data.token).toBeUndefined();
			expect(res.data.tokenExpires).toBeUndefined();
			expect(res.resultCode).toBe('111:OK_2FA_LOGIN');
		} catch(e) { msg += 'actionPutLogin failed #35\n' }

		return getUser({key: key});
	})
	.then((res) => {

		user = res;

		try{
			expect(res.user.userName).toBe('my.action8.test.user.1');
		} catch(e) { msg += 'getUser failed #36\n' }

		return actionPutTwofa(user, '000000');
	})
	.then((res) => {

		msg += 'actionPutTwofa resolved instead of rejecting #37\n';
	})
	.catch((res) => {

		try{
			expect(res.resultCode).toBe('1005:ERROR_AUTHORIZATION');
		} catch(e) { msg += 'actionPutTwofa failed #38\n' }

		return generateTwofaToken(code);
	})
	.then((res) => {

		try{
			expect(res).toBeDefined();
		} catch(e) { msg += 'generateTwofaToken failed #39\n' }

		return actionPutTwofa(user, res);
	})
	.then((res) => {

		try{
			expect(res.data.token.length).toBeGreaterThan(0);
			expect(res.data.tokenExpires.length).toBeGreaterThan(0);
		} catch(e) { msg += 'actionPutTwofa failed #40\n' }

		return actionPostTwofa(user, '000000');
	})
	.then((res) => {

		msg += 'actionPostTwofa resolved instead of rejecting #41\n';
	})
	.catch((res) => {

		try{
			expect(res.resultCode).toBe('1004:ERROR_TOKEN');
		} catch(e) { msg += 'actionPostTwofa failed #42\n' }

		return generateTwofaToken(code);
	})
	.then((res) => {

		try{
			expect(res).toBeDefined();
		} catch(e) { msg += 'generateTwofaToken failed #43\n' }

		return actionPostTwofa(user, res);
	})
	.then((res) => {

		try{
			expect(res.resultCode).toBe('101:OK_BASIC');
		} catch(e) { msg += 'actionPostTwofa failed #44\n' }

		if(msg.length) throw msg;

		return deleteUserByNameAction('my.action8.test.user.1');
	})
	// .then((res) => console.log((res) ? 'my.action8.test.user.1 deleted' : 'Database cleanup required for my.action8.test.user.1'))
	.then((res) => {})
	.catch((err) => {

		console.log(`v1UAction-08 errors:\n${err}`);
		deleteUserByNameAction('my.action8.test.user.1');
		return expect(err).toBeFalsy();
	});
});


test('v1UAction-09 will register user, update token, and delete user', () => {

	let msg = '';

	let testData = {
		name: 'My Action9 Test User',
		password: 'mypassword',
	};

	let key,
		token = {};

	return actionPostRegister(testData)
	.then((res) => {

		try{
			expect(res.resultCode).toBe('104:OK_REGISTER');
			token.token = res.data.token;
			token.expires = res.data.tokenExpires;
			key = res.data.key;
		} catch(e) { msg += 'actionPostRegister failed #41\n' }

		return getUser({key: key});
	})
	.then((res) => {

		try{
			expect(res.user.userName).toBe('my.action9.test.user.1');
		} catch(e) { msg += 'getUser failed #42\n' }

		return actionGetToken(res);
	})
	.then((res) => {

		try{
			expect(res.resultCode).toBe('112:OK_TOKEN_REFRESHED');
			expect(res.data.token).not.toBe(token.token);
		} catch(e) { msg += 'actionGetToken failed #43\n' }

		if(msg.length) throw msg;

		return deleteUserByNameAction('my.action9.test.user.1');
	})
	// .then((res) => console.log((res) ? 'my.action9.test.user.1 deleted' : 'Database cleanup required for my.action9.test.user.1'))
	.then((res) => {})
	.catch((err) => {

		console.log(`v1UAction-09 errors:\n${err}`);
		deleteUserByNameAction('my.action9.test.user.1');
		return expect(err).toBeFalsy();
	});
});

