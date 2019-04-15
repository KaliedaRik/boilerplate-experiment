module.exports = {
	whereAmI: 'process environment',
	whatAmI: 'database credentials',

	databaseUrl: process.env.RWB_ARANGODB_DATABASEURL,
	databaseUsr: process.env.RWB_ARANGODB_DATABASEUSR,
	databasePwd: process.env.RWB_ARANGODB_DATABASEPWD,
	databaseName: process.env.RWB_ARANGODB_DATABASENAME,

	poolCheckerInterval:  process.env.RWB_ARANGODB_POOLCHECKERINTERVAL,
	poolHandleBecomesStale:  process.env.RWB_ARANGODB_POOLHANDLEBECOMESSTALE,
	tokenCheckerInterval:  process.env.RWB_ARANGODB_TOKENCHECKERINTERVAL,
	twofaCheckerIinterval:  process.env.RWB_ARANGODB_TWOFACHECKERINTERVAL,
};
