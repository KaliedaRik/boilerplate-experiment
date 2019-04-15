const arangojs = require("arangojs");
const moment = require("moment");

const getDatabaseEnvironmentVariables = () => {
	if(process.env.MYENVIRONMENT === 'dev'){
		return require('./z-dev-arangodb-env.js');
	}
	else{
		return require('./z-prod-arangodb-env.js');

		// alternative file for retrieving env vars from server process.env values
		// return require('./z-process-arangodb.js');
	}
};

const { 
	databaseName,
	databasePwd, 
	databaseUrl, 
	databaseUsr,
	poolCheckerInterval,
	poolHandleBecomesStale,
	tokenCheckerInterval,
	twofaCheckerIinterval } = getDatabaseEnvironmentVariables();

const Database = arangojs.Database;
var dbPool = [];


// database connections pool
// ---------------------------------------------------------------------- //

// helper function - check for handles in pool that haven't been used in a while
const poolChecker = () => {

	let poolLength = dbPool.length,
		i, h, newPool;

	if(poolLength){
		newPool = [];
		for(i = 0; i < poolLength; i++){
			h = dbPool[i];
			if(moment().toISOString() < moment(h.lastUsed).add(poolHandleBecomesStale, 'milliseconds').toISOString()){
				newPool.push(h);
			}
		}
		dbPool = [].concat(newPool);
	}
	// console.log(`pool check done - ${dbPool.length} handles in pool`);
};
setInterval(poolChecker, poolCheckerInterval);

// helper function - check for stale tokens
const _tokenChecker = `
	FOR t IN UserTokens
		FILTER DATE_TIMESTAMP(t.expires) < DATE_NOW()
		REMOVE t IN UserTokens
		RETURN OLD`;

const tokenChecker = () => {

	let handle;

	requestDatabaseHandle()
	.then((res) => {

		handle = res;
		if(!handle) throw 'unable to connect to database';

		return handle.query({
			query: _tokenChecker,
			bindVars: {}
		});
	})
	.then((cursor) => cursor.all())
	.then((res) => {
		// console.log(`tokenChecker removed ${res.length ? res.length : 0} tokens`); 
		returnDatabaseHandle(handle);
	})
	.catch((err) => { 
		console.log('tokenChecker error', err); 
		if(handle){
			returnDatabaseHandle(handle);
		}
	});
};
setInterval(tokenChecker, tokenCheckerInterval);

// helper function - check for stale twofa windows
const _twofaChecker = `
	FOR u IN Users
		FILTER u.twofaTriggered == true && DATE_TIMESTAMP(u.twofaWindowCloses) < DATE_NOW()
		UPDATE u WITH { 
			twofaWindowCloses: null, 
			twofaTriggered: null
		} IN Users OPTIONS { keepNull: false }
		RETURN OLD`;

const twofaChecker = () => {

	let handle;

	requestDatabaseHandle()
	.then((res) => {

		handle = res;
		if(!handle) throw 'unable to connect to database';

		return handle.query({
			query: _twofaChecker,
			bindVars: {}
		});
	})
	.then((cursor) => cursor.all())
	.then((res) => {
		// console.log(`twofaChecker closed ${res.length ? res.length : 0} windows`); 
		returnDatabaseHandle(handle);
	})
	.catch((err) => { 
		console.log('twofaChecker error', err); 
		if(handle){
			returnDatabaseHandle(handle);
		}
	});
};
setInterval(twofaChecker, twofaCheckerIinterval);


// database connections management
// ---------------------------------------------------------------------- //

const catchHandleHelper = (err, handle) => {

	let msg = err.body || err.message || err;
	console.log(msg);

	if(handle){
		returnDatabaseHandle(handle);
	}
};

const resolveFirstResultOnly = (handle, res) => {

	if(handle){
		returnDatabaseHandle(handle);
	}

	if(res && res[0]){
		return res[0];
	}

	return false;
};

const getFirstResultOnly = (res) => {

	if(res && res[0]){
		return res[0];
	}

	return false;
};

// get a database handle
const requestDatabaseHandle = () => {
	return new Promise((resolve, reject) => {

		if(!dbPool.length){
			let h = new Database(databaseUrl);
			h.useDatabase(databaseName);
			h.useBasicAuth(databaseUsr, databasePwd);
			h.lastUsed = moment().toISOString();
			dbPool.push(h);
		}

		resolve(dbPool.shift());
	});
};

// return a database handle to the pool
const returnDatabaseHandle = (h) => {

	if(h && h.createDatabase){
		h.lastUsed = moment().toISOString();
		dbPool.push(h);
		return true;
	}
	else return false;
};


module.exports = {
	catchHandleHelper,
	getFirstResultOnly,
	resolveFirstResultOnly,
	requestDatabaseHandle,
	returnDatabaseHandle,
};
