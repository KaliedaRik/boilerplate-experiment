const getServerEnvironmentVariables = () => {
	if(process.env.MYENVIRONMENT === 'dev'){
		return require('./z-dev-server-env.js');
	}
	else{
		return require('./z-prod-server-env.js');

		// alternative file for retrieving env vars from server process.env values
		// return require('./z-process-server.js');
	}
};

const { 
	defaultLocale, 
	emailChecker, 
	passwords, 
	singleUseTokens,
	twoFactor, 
	webTokens } = getServerEnvironmentVariables();

const { makeUuid } = require(`./plugin-${singleUseTokens}.js`);

const { checkPassword,
		encryptPassword } = require(`./plugin-${passwords}.js`);

const { verifyEmail } = require(`./plugin-${emailChecker}.js`);

const { makeToken,
		verifyToken } = require(`./plugin-${webTokens}.js`);

const { generateTwofaToken,
		makeTwofaCodes,
		verifyTwofaToken } = require(`./plugin-${twoFactor}.js`);

const cascadeHead = () => {
	return Promise.resolve({ 
		then: function(resolve) {
			resolve(true);
		}
	});
};



module.exports = {
	cascadeHead,
	checkPassword,
	encryptPassword,
	generateTwofaToken,
	getServerEnvironmentVariables,
	makeToken,
	makeTwofaCodes,
	makeUuid,
	verifyEmail,
	verifyToken,
	verifyTwofaToken,
};
