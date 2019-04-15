module.exports = {
	whereAmI: 'STACK environment',
	whatAmI: 'database credentials',

	databaseUrl: '',
	databaseUsr: '',
	databasePwd: '',
	databaseName: '',

	poolCheckerInterval: 60000, 			// perform a review of pooled connection handles every x microseconds
	poolHandleBecomesStale: 300000, 		// no of microseconds since last use after which a connection handle becomes stale
	tokenCheckerInterval: 60000, 			// perform a review of stored tokens every x microseconds
	twofaCheckerIinterval: 60000, 			// perform a review of stored twofa values every x microseconds
};
