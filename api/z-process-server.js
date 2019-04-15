module.exports = {
	whereAmI: 'process environment',
	whatAmI: 'server credentials',
	port: process.env.RWB_SERVER_PORT,

	allowedOrigins: process.env.RWB_SERVER_ALLOWEDORIGINS,

	// locales
	defaultLocale: process.env.RWB_SERVER_DEFAULTLOCALE,
	localeList: (process.env.RWB_SERVER_LOCALELIST.substring) ? JSON.parse(process.env.RWB_SERVER_LOCALELIST) : ['*'],

	// plugins
	database: process.env.RWB_SERVER_DATABASE,
	emailChecker: process.env.RWB_SERVER_EMAILCHECKER,
	emailer: process.env.RWB_SERVER_EMAILER,
	passwords: process.env.RWB_SERVER_PASSWORDS,
	singleUseTokens: process.env.RWB_SERVER_SINGLEUSETOKENS,
	twoFactor: process.env.RWB_SERVER_TWOFACTOR,
	webTokens: process.env.RWB_SERVER_WEBTOKENS,

	// magic numbers
	singleUseTokenExpires: process.env.RWB_SERVER_SINGLEUSETOKENEXPIRES,
	humanAuthTokenExpires: process.env.RWB_SERVER_HUMANAUTHTOKENEXPIRES,
	botAuthTokenExpires: process.env.RWB_SERVER_BOTAUTHTOKENEXPIRES,
};
