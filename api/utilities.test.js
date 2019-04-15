const utils = require('./utilities.js');
const moment = require('moment');


test('U-01 retrieve the correct environment variables', () => {

	let result;

	process.env.MYENVIRONMENT = null
	result = utils.getServerEnvironmentVariables();
	expect(result).toHaveProperty('whereAmI', 'production environment');
	expect(result).toHaveProperty('whatAmI', 'server credentials');

	process.env.MYENVIRONMENT = 'dev'
	result = utils.getServerEnvironmentVariables();
	expect(result).toHaveProperty('whereAmI', 'development environment');
	expect(result).toHaveProperty('whatAmI', 'server credentials');
});


test('U-02 generate a correctly formatted uuid', () => {

	let result = utils.makeUuid();
	expect(result).toMatch(/^........-....-....-....-............$/);
});


test('U-03 check for malformed, unknown and known email addresses', () => {

	let goodEmail = 'rik.roots@rikworks.co.uk',  	// HARDCODED DATA that needs to be separated out into a Z- file
		badEmail = 'unknown.email@rikworks.co.uk',  // HARDCODED DATA that needs to be separated out into a Z- file
		malformedEmail = 'thisIsNotAnEmailAddress', 
		msg = '';

	return utils.verifyEmail(goodEmail)
	.then((res) => {

		try{
			expect(res).toBeTruthy();
		} catch(e) { msg += 'utils.verifyEmail(goodEmail) failed\n' }

		return utils.verifyEmail(badEmail);
	})
	.then((res) => {

		try{
			expect(res).toBeFalsy();
		} catch(e) { msg += 'utils.verifyEmail(badEmail) failed\n' }

		return utils.verifyEmail(malformedEmail);
	})
	.then((res) => {

		try{
			expect(res).toBeFalsy();
		} catch(e) { msg += 'verifyEmail(malformedEmail) failed\n' }

		if(msg.length) throw msg;
		return true;
	})
	.catch((err) => {
		console.log(`U-03 errors:\n${err}`);
		return expect(err).toBeFalsy();
	});
});


test('U-04 create and verify a token', () => {

	let data = {
		name: 'somename',
		email: 'somename@example.com',
		locale: 'xp'
	};
	let tokenSecret = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

	let token1, token2, secret, decoded, 
		msg = '';

	return utils.makeToken(data, tokenSecret, 2)
	.then((res) => {

		token1 = res.token;
		secret = res.secret;

		try{
			expect(secret).toMatch(/^........-....-....-....-............$/);
			expect(token1.length).toBeGreaterThan(200);
			expect(moment(res.expires).unix()).toBeGreaterThan(moment().unix());
		} catch(e) { msg += 'utils.makeToken() failed\n' }

		return utils.verifyToken(token1, secret);
	})
	.then((res) => {

		token2 = res.token;
		decoded = res.data.data;

		try{
			expect(token2).toMatch(token1);
			expect(decoded.name).toMatch(data.name);
			expect(decoded.locale).toMatch(data.locale);
			expect(decoded.email).toMatch(data.email);
		} catch(e) { msg += 'utils.verifyToken() failed\n' }
		
		return utils.verifyToken(token1, 'thisIsTheWrongSecret');
	})
	.then((res) => {

		try{
			expect(res).toBeFalsy();
		} catch(e) { msg += 'utils.verifyToken(badSecret) failed\n' }

		if(msg.length) throw msg;
		return true;
	})
	.catch((err) => {
		console.log(`U-04 errors:\n${err}`);
		return expect(err).toBeFalsy();
	});
});


test('U-05 create and verify a password', () => {

	let pwd = 'mylongandcomplicatedpassword',
		hash, 
		msg = '';

	return utils.encryptPassword(pwd)
	.then((res) => {

		hash = res;

		try{
			expect(hash).toBeDefined();
		} catch(e) { msg += 'utils.encryptPassword() failed\n' }

		return utils.checkPassword(pwd, hash);
	})
	.then((res) => {

		try{
			expect(res).toBeTruthy();
		} catch(e) { msg += 'utils.checkPassword() failed\n' }

		return utils.checkPassword('thisisnotmypassword', hash);
	})
	.then((res) => {

		try{
			expect(res).toBeFalsy();
		} catch(e) { msg += 'utils.checkPassword(badPassword) failed\n' }

		if(msg.length) throw msg;
		return true;
	})
	.catch((err) => {
		console.log(`U-05 errors:\n${err}`);
		return expect(err).toBeFalsy();
	});
});


test('U-06 create and verify a two-factor authentication code', () => {

	let secret, 
		msg = '';

	return utils.makeTwofaCodes()
	.then((res) => {

		try{
			secret = res;
			expect(secret).toBeDefined();
			expect(secret.secret).toBeDefined();
			expect(secret.image).toBeDefined();
		} catch(e) { msg += 'utils.makeTwofaCodes() failed\n' }

		return utils.generateTwofaToken(secret.secret);
	})
	.then((token) => {

		try{
			expect(token).toBeDefined();
		} catch(e) { msg += 'utils.generateTwofaToken() failed\n' }

		return utils.verifyTwofaToken(secret.secret, token);
	})
	.then((res) => {

		try{
			expect(res).toBeTruthy();
		} catch(e) { msg += 'utils.verifyTwofaToken() failed\n' }

		if(msg.length) throw msg;
		return true;
	})
	.catch((err) => {
		console.log(`U-06 errors:\n${err}`);
		return expect(err).toBeFalsy();
	});
});
