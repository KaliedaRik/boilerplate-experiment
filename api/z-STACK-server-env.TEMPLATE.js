module.exports = {
	whereAmI: 'STACK environment',
	whatAmI: 'server credentials',
	port: PORT_VALUE,									// 8080

	allowedOrigins: [],									// CORS - domains and subdomains allowed in your application (for public, use ['*'])

	// locales
	defaultLocale: 'en',
	localeList: ['en', 'xp'],							// for process.env environment, this should be a JSON.stringify array

	// plugins
	database: 'DATABASE_PLUGIN', 						// 'arangodb'
	emailChecker: 'EMAIL_CHECKER_PLUGIN',				// 'email-verify'
	emailer: '3RD_PARTY_EMAIL_PLUGIN',					// 'mailgun'
	passwords: 'PASSWORDS_PLUGIN',						// 'argon'
	singleUseTokens: 'SINGLE_USE_TOKENS_PLUGIN',		// 'uuid'
	twoFactor: 'TWO_FACTOR_AUTH_PLUGIN', 				// 'speakeasy'
	webTokens: 'WEB_TOKENS_PLUGIN',						// 'jwt'

	// magic variables
	singleUseTokenExpires: 1,							// time (in hours) between token creation and expiry
	humanAuthTokenExpires: 72,							// time (in hours) between token creation and expiry
	botAuthTokenExpires: 1,								// time (in hours) between token creation and expiry
};
