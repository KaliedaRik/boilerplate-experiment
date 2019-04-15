// NOTE - THESE TESTS WILL FAIL IF THE DATABASE SERVER IS NOT RUNNING

process.env.MYENVIRONMENT = 'dev';

const moment = require('moment');

const { 
	createToken,			// v1UD-01
	retrieveToken,			// v1UD-01

	createArchive,			// v1UD-05
	deleteArchive,			// v1UD-05
	retrieveArchive,		// v1UD-05

	initializeNewUser,		// v1UD-02
	confirmNewUser,			// v1UD-02

	recordLogin,			// v1UD-02

	getUser,				// v1UD-03
	updateUser,				// v1UD-04
	updateUserEmail,		// v1UD-04

	retrieveAdminKeys,		// v1UD-06
	retrieveNonAdminKeys,	// v1UD-06
	retrieveUserKeys,		// v1UD-06

	deleteUser,				// v1UD-02
	deleteUserByNameAction } = require('./v1-database.js');

test('v1UD-01: create and retrieve a token in UserTokens collection', () => {

	let token = 'myTestToken1',
		userName = 'my.test.token.username.1';

	return createToken(token, false)
	.then((res) => {
		expect(res).toBeFalsy();
		return createToken(false, userName);
	})
	.then((res) => {
		expect(res).toBeFalsy();
		return createToken(token, userName);
	})
	.then((res) => {
		expect(res._key).toBe('myTestToken1');
		expect(res.userName).toBe('my.test.token.username.1');
		expect(moment(res.expires).unix()).toBeGreaterThan(moment().unix());
		return retrieveToken();
	})
	.then((res) => {
		expect(res).toBeFalsy();
		return retrieveToken('unknownToken');
	})
	.then((res) => {
		expect(res).toBeFalsy();
		return retrieveToken('myTestToken1');
	})
	.then((res) => {
		expect(res).toBe('my.test.token.username.1');
	})
	.catch((err) => {
		console.log('v1UD-01 error', err);
		retrieveToken('myTestToken1');
		expect(err).toBeFalsy();
	})
});

test('v1UD-02: create and finalize a new user', () => {

	let items = {
		name: 'Database Test2 User',
		hash: 'Database_Test2_User_hash',
		recoveryHash: 'Database_Test2_User_recoveryHash',
		twofaCode: 'Database_Test2_User_twofaCode',
	};

	let key;

	return initializeNewUser(items)
	.then((res) => {
		expect(res).toBeFalsy();
		items.tokenSecret = 'Database_Test2_User_secret';
		return initializeNewUser(items);
	})
	.then((res) => {

		key = res.user._key;

		expect(res.user.name).toBe('Database Test2 User');
		expect(res.user.userName).toBe('database.test2.user.1');
		expect(res.user.locale).toBe('en');
		expect(res.user.twoFaIsEnabled).toBeFalsy();
		expect(res.user.isHuman).toBeTruthy();
		expect(res.user.isActive).toBeFalsy();
		expect(res.user.isArchived).toBeFalsy();
		expect(res.user.lastLogin).toBeUndefined();
		expect(res.user.tokenExpires).toBeUndefined();

		expect(res.secrets.hash).toBe('Database_Test2_User_hash');
		expect(res.secrets.recoveryHash).toBe('Database_Test2_User_recoveryHash');
		expect(res.secrets.tokenSecret).toBe('Database_Test2_User_secret');

		expect(res.auths.isAdministrator).toBeFalsy();
		expect(res.auths.canArchiveOtherUsers).toBeFalsy();
		expect(res.auths.canDeleteOtherUsers).toBeFalsy();

		return confirmNewUser(key, 'timeIsEternal');
	})
	.then((res) => {
		expect(res.user.name).toBe('Database Test2 User');
		expect(res.user.userName).toBe('database.test2.user.1');
		expect(res.user.locale).toBe('en');
		expect(res.user.twoFaIsEnabled).toBeFalsy();
		expect(res.user.isHuman).toBeTruthy();
		expect(res.user.isActive).toBeTruthy();
		expect(res.user.isArchived).toBeFalsy();
		expect(res.user.lastLogin).toBeDefined();
		expect(res.user.tokenExpires).toBe('timeIsEternal');

		expect(res.secrets.hash).toBe('Database_Test2_User_hash');
		expect(res.secrets.recoveryHash).toBe('Database_Test2_User_recoveryHash');
		expect(res.secrets.tokenSecret).toBe('Database_Test2_User_secret');

		expect(res.auths.isAdministrator).toBeFalsy();
		expect(res.auths.canArchiveOtherUsers).toBeFalsy();
		expect(res.auths.canDeleteOtherUsers).toBeFalsy();

		return recordLogin('anUnknownKey');
	})
	.then((res) => {
		expect(res).toBeFalsy();
		return recordLogin(key);
	})
	.then((res) => {
		expect(res).toBeTruthy();
		return deleteUser('anUnknownKey');
	})
	.then((res) => {
		expect(res).toBeFalsy();
		return deleteUser(key);
	})
	.then((res) => {
		expect(res).toBeTruthy();
		// console.log((res) ? 'database.test2.user.1 deleted' : 'Database cleanup required for database.test2.user.1 deleted')
	})
	.catch((err) => {
		console.log('v1UD-02 error', err);
		deleteUserByNameAction('database.test2.user.1');
		expect(err).toBeFalsy();
	})
});

test('v1UD-03: create and retrieve user in various ways', () => {

	let items = {
		name: 'Database Test3 User',
		hash: 'Database_Test3_User_hash',
		email: 'thisIsAnEmailAddress_tooLateHereToCheckItsValidity',
		twofaCode: 'Database_Test3_User_twofaCode',
		tokenSecret: 'Database_Test3_User_secret',
	};

	return initializeNewUser(items)
	.then((res) => {
		expect(res.user.userName).toBe('database.test3.user.1');
		expect(res.secrets.hash).toBe('Database_Test3_User_hash');
		expect(res.auths.isAdministrator).toBeFalsy();
		return getUser({key: res.user._key});
	})
	.then((res) => {
		expect(res.user.userName).toBe('database.test3.user.1');
		expect(res.secrets.hash).toBe('Database_Test3_User_hash');
		expect(res.auths.isAdministrator).toBeFalsy();
		return getUser({userName: 'database.test3.user.1'});
	})
	.then((res) => {
		expect(res.user.userName).toBe('database.test3.user.1');
		expect(res.secrets.hash).toBe('Database_Test3_User_hash');
		expect(res.auths.isAdministrator).toBeFalsy();
		return getUser({email: 'thisIsAnEmailAddress_tooLateHereToCheckItsValidity'});
	})
	.then((res) => {
		expect(res.user.userName).toBe('database.test3.user.1');
		expect(res.secrets.hash).toBe('Database_Test3_User_hash');
		expect(res.auths.isAdministrator).toBeFalsy();
		return createToken('Database_Test3_User_token', 'database.test3.user.1');
	})
	.then((res) => {
		return getUser({token: 'Database_Test3_User_token'});
	})
	.then((res) => {
		expect(res.user.userName).toBe('database.test3.user.1');
		expect(res.secrets.hash).toBe('Database_Test3_User_hash');
		expect(res.auths.isAdministrator).toBeFalsy();
		return deleteUserByNameAction('database.test3.user.1');
	})
	// .then((res) => console.log((res) ? 'database.test3.user.1 deleted' : 'Database cleanup required for database.test3.user.1'))
	.then((res) => {})
	.catch((err) => {
		console.log('v1UD-03 error', err);
		deleteUserByNameAction('database.test3.user.1');
		expect(err).toBeFalsy();
	})
});

test('v1UD-04: create and update user in various ways, including email and token', () => {

	let items = {
		name: 'Database Test4 User',
		hash: 'Database_Test4_User_hash',
		email: 'thisIsAnEmailAddress_tooLateHereToCheckItsValidity',
		twofaCode: 'Database_Test4_User_twofaCode',
		tokenSecret: 'Database_Test4_User_secret',
	};

	let updates = {
		name: 'Database Test4 Updated User',
		hash: 'Database_Test4_Updated_User_hash',
		_id: 'troll',
		recoveryHash: 'Database_Test4_New_User_recoveryHash',
		email: 'thisIsAnEmailAddress_Updated',
		dog: 'Nicky',
		lastLogin: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
		_key: null,
		updatedOn: 'troll',
		twofaCode: 'Database_Test4_Updated_User_twofaCode',
		twofaIsEnabled: true,
		isHuman: 'troll',
		createdOn: 'troll',
		tokenSecret: 'Database_Test4_Updated_User_secret',
		isActive: 42,
		_rev: true,
		cat: 'Jojo',
		isAdministrator: true,
		canArchiveOtherUsers: true,
		canDeleteOtherUsers: true,
		twofaImage: 'thisIsNotAnImage',
		isArchived: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
		locale: 'fr',
	};

	let key;

	return initializeNewUser(items)
	.then((res) => {
		key = res.user._key;
		expect(res.user.userName).toBe('database.test4.user.1');
		expect(res.secrets.hash).toBe('Database_Test4_User_hash');
		expect(res.auths.isAdministrator).toBeFalsy();
		return updateUser(updates, key);
	})
	.then((res) => {
		expect(res).toBeTruthy();
		return getUser({key: key});
	})
	.then((res) => {
		expect(res.user._key).toBe(key);
		expect(res.user.name).toBe('Database Test4 Updated User');
		expect(res.user.userName).toBe('database.test4.user.1');
		expect(res.user.locale).toBe('fr');
		expect(res.user.email).toBe('thisIsAnEmailAddress_tooLateHereToCheckItsValidity');
		expect(res.user.newEmail).toBe('thisIsAnEmailAddress_Updated');
		expect(res.user.isHuman).toBeTruthy();
		expect(res.user.isActive).toBeFalsy();
		expect(res.user.isArchived).toBeFalsy();
		expect(res.user.lastLogin).toBeUndefined();
		expect(res.user.tokenExpires).toBeUndefined();
		expect(res.user.twofaIsEnabled).toBeTruthy();

		expect(res.secrets._key).toBe(key);
		expect(res.secrets.hash).toBe('Database_Test4_Updated_User_hash');
		expect(res.secrets.recoveryHash).toBe('Database_Test4_New_User_recoveryHash');
		expect(res.secrets.tokenSecret).toBe('Database_Test4_Updated_User_secret');
		expect(res.secrets.twofaCode).toBe('Database_Test4_Updated_User_twofaCode');
		expect(res.secrets.twofaImage).toBe('thisIsNotAnImage');

		expect(res.auths.isAdministrator).toBeTruthy();
		expect(res.auths.canArchiveOtherUsers).toBeTruthy();
		expect(res.auths.canDeleteOtherUsers).toBeTruthy();

		expect(res.user.dog).toBe('Nicky');
		expect(res.user.cat).toBe('Jojo');

		return updateUserEmail(key);
	})
	.then((res) => {
		expect(res).toBeTruthy();
		return getUser({key: key});
	})
	.then((res) => {
		expect(res.user._key).toBe(key);
		expect(res.user.email).toBe('thisIsAnEmailAddress_Updated');
		expect(res.user.newEmail).toBeUndefined();

		return deleteUserByNameAction('database.test4.user.1');
	})
	// .then((res) => console.log((res) ? 'database.test4.user.1 deleted' : 'Database cleanup required for database.test4.user.1'))
	.then((res) => {})
	.catch((err) => {
		console.log('v1UD-04 error', err);
		deleteUserByNameAction('database.test4.user.1');
		expect(err).toBeFalsy();
	})
});

// NEEDS TO BE REWRITTEN
// createArchive parameters changed; function also creates new user document
// test('v1UD-05: create, retrieve and delete an archive in UserArchives collection', () => {

// 	let archive = 'myTestArchive1',
// 		userName = 'my.test.archive.username.1',
// 		userKey = 'myTestArchive1UserKey';

// 	return createArchive(archive, false, userKey)
// 	.then((res) => {
// 		console.log('v1UD-05 #1', res);
// 		expect(res).toBeFalsy();
// 		return createArchive(false, userName, userKey);
// 	})
// 	.then((res) => {
// 		console.log('v1UD-05 #2', res);
// 		expect(res).toBeFalsy();
// 		return createArchive('myNonceArchive1', userName, false);
// 	})
// 	.then((res) => {
// 		console.log('v1UD-05 #2a', res);
// 		expect(res).toBeFalsy();
// 		return createArchive('myNonceArchive1', userName, userKey);
// 	})
// 	.then((res) => {
// 		console.log('v1UD-05 #3', res);
// 		expect(res._key).toBe('my.test.archive.username.1');
// 		expect(res.archive).toBe('myNonceArchive1');
// 		return createArchive(archive, userName);
// 	})
// 	.then((res) => {
// 		console.log('v1UD-05 #4', res);
// 		expect(res._key).toBe('my.test.archive.username.1');
// 		expect(res.archive).toBe('myTestArchive1');
// 		return retrieveArchive();
// 	})
// 	.then((res) => {
// 		console.log('v1UD-05 #5', res);
// 		expect(res).toBeFalsy();
// 		return retrieveArchive('unknownKey');
// 	})
// 	.then((res) => {
// 		console.log('v1UD-05 #6', res);
// 		expect(res).toBeFalsy();
// 		return retrieveArchive('my.test.archive.username.1');
// 	})
// 	.then((res) => {
// 		console.log('v1UD-05 #7', res);
// 		expect(res.archive).toBe('myTestArchive1');
// 		return deleteArchive();
// 	})
// 	.then((res) => {
// 		console.log('v1UD-05 #8', res);
// 		expect(res).toBeFalsy();
// 		return deleteArchive('unknownKey');
// 	})
// 	.then((res) => {
// 		console.log('v1UD-05 #9', res);
// 		expect(res).toBeFalsy();
// 		return deleteArchive('my.test.archive.username.1');
// 	})
// 	.then((res) => {
// 		console.log('v1UD-05 #10', res);
// 		expect(res.archive).toBe('myTestArchive1');
// 	})
// 	.catch((err) => {
// 		console.log('v1UD-05 error', err);
// 		return deleteArchive('my.test.archive.username.1');
// 		expect(err).toBeFalsy();
// 	})
// });

// TODO: this test is flaky and needs to be rethought
// - will fail if other tests across the code base have created users but not yet cleaned up after themselves
// test('v1UD-06: create, manipulate and count user authorizations collection', () => {

// 	let items1 = {
// 		name: 'Database Test6a User',
// 		tokenSecret: 'Database_Test6_User_secret',
// 		twofaCode: 'Database_Test6_User_twofaCode',
// 		hash: 'Database_Test6_User_hash',
// 	};

// 	let items2 = {
// 		name: 'Database Test6b User',
// 		tokenSecret: 'Database_Test6_User_secret',
// 		twofaCode: 'Database_Test6_User_twofaCode',
// 		hash: 'Database_Test6_User_hash',
// 		isAdministrator: true,
// 	};

// 	return initializeNewUser(items1)
// 	.then((res) => {
// 		expect(res.user.userName).toBe('database.test6a.user.1');
// 		expect(res.secrets.hash).toBe('Database_Test6_User_hash');
// 		expect(res.auths.isAdministrator).toBeFalsy();
// 		return initializeNewUser(items2);
// 	})
// 	.then((res) => {
// 		expect(res.user.userName).toBe('database.test6b.user.1');
// 		expect(res.secrets.hash).toBe('Database_Test6_User_hash');
// 		expect(res.auths.isAdministrator).toBeTruthy();
// 		return retrieveAdminKeys();
// 	})
// 	.then((res) => {
// 		expect(res.length).toBe(1);
// 		return retrieveNonAdminKeys();
// 	})
// 	.then((res) => {
// 		expect(res.length).toBe(1);
// 		return retrieveUserKeys();
// 	})
// 	.then((res) => {
// 		expect(res.length).toBe(2);
// 		expect(res[0]).not.toBe(res[1]);
// 		deleteUserByNameAction('database.test6a.user.1');
// 		deleteUserByNameAction('database.test6b.user.1');
// 	})
// 	.catch((err) => {
// 		console.log('v1UD-06 error', err);
// 		deleteUserByNameAction('database.test6a.user.1');
// 		deleteUserByNameAction('database.test6b.user.1');
// 		expect(err).toBeFalsy();
// 	})
// });
