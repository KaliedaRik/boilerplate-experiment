const moment = require('moment');

const { 
	catchHandleHelper,
	requestDatabaseHandle,
	returnDatabaseHandle,
	resolveFirstResultOnly } = require('./plugin-arangodb-connection.js');

const { 
	getUser,
	deleteUserByNameAction } = require('./plugin-arangodb-user.js');


// helper functions
// --------------------------------------------------------------------------------------------------

// good for removing system data from regular collections
// - will need to write a similar function if we ever need to collect user data from edge collections
const removeSystemData = (data) => {

	let obj, objKeys, k, i, iz;

	obj = JSON.parse(JSON.stringify(data));
	objKeys = Object.keys(obj);

	for(i = 0, iz = objKeys.length; i < iz; i++){
		k = objKeys[i];
		if(k[0] === '_'){
			delete obj[k];
		}
	}

	return obj;
};


const _getUserCoreData = `
	FOR u IN Users
		FILTER u.userName == @name
		RETURN u`;

const getUserCoreData = (handle, userName) => {
	return new Promise((resolve, reject) => {

		if(userName && handle && handle.query){

			handle.query({
				query: _getUserCoreData,
				bindVars: {
					name: userName,
				}
			})
			.then((cursor) => cursor.all())
			.then((res) => {
				if(res && res[0]){
					resolve(res[0]);
				}
				resolve(false)
			})
			.catch((err) => resolve(false));
		}
		else resolve(false);
	});
};


const _getUserAuthData = `
	FOR u IN UserAuths
		FILTER u._key == @key
		RETURN u`;

const getUserAuthData = (handle, key) => {
	return new Promise((resolve, reject) => {

		if(key && handle && handle.query){

			handle.query({
				query: _getUserAuthData,
				bindVars: {
					key: key,
				}
			})
			.then((cursor) => cursor.all())
			.then((res) => {
				if(res && res[0]){
					resolve(res[0]);
				}
				resolve(false)
			})
			.catch((err) => resolve(false));
		}
		else resolve(false);
	});
};


// template for building bespoke gather functions
const _getUserDemoData = ``;
const getUserDemoData = (handle, key) => {
	return new Promise((resolve, reject) => {

		if(key && handle && handle.query){

			resolve(false)
		}
		else resolve(false);
	});
};


// template for building bespoke delete functions
const _deleteUserDemoData = ``;
const deleteUserDemoData = (handle, key) => {
	return new Promise((resolve, reject) => {

		if(key && handle && handle.query){

			resolve(false)
		}
		else resolve(false);
	});
};


// exported functions
// --------------------------------------------------------------------------------------------------

const getAllUserData = (userName) => {
	return new Promise((resolve, reject) => {

		let archive = {
			archiveDate: moment().utc().toISOString(),
			userName: userName,
		};

		let userKey, handle;

		if(userName){

			requestDatabaseHandle()
			.then((res) => {

				handle = res;
				if(!handle) throw 'unable to connect to database';

				// user core data is the data stored in the Users collection
				// - specifically exclude any user data stored in UserSecrets collection - these will need to be freshly regenerated if user ever restores
				// - do not include data from UserTokens collection - tokens will all be stale within a few days, thus useless
				// - do not include data from UserArchives - would be including (probably old) data needlessly
				return getUserCoreData(handle, userName);
			})
			.then((res) => {

				if(!res || !res._key) throw 'failed to retrieve user core data';

				userKey = archive.userKey = res._key;
				archive.user = removeSystemData(res);

				// retrieve user authorizations data from UserAuths collection
				return getUserAuthData(handle, userKey);
			})
			.then((res) => {

				// failure at this point is not a worry, so don't throw if res returns false or undefined or empty
				if(res){
					archive.userAuths = removeSystemData(res);
				}

				// boilerplate code goes no further than this
				// - for each database collection that has userdata that needs to be included, add another .then to the promise chain
				return getUserDemoData(handle, userName);
			})
			.then((res) => {

				if(res){
					archive.userDemoData = removeSystemData(res);
				}

				// final then in the gathering operations should return true
				// - so the next then can be left alone to deal with necessary cleanup and resolution duties
				return true; 
			})
			.then(() => {

				// when all data retrieved, resolve the archive object
				returnDatabaseHandle(handle); 
				resolve(archive); 
			})
			.catch((err) => { 

				catchHandleHelper(err, handle); 

				// function will always resolve an archive object, even if it is mostly empty
				resolve(archive); 
			});
		}
		// function will always resolve an archive object, even if it is mostly empty
		else resolve(archive);
	});
};


const deleteAllUserData = (userKey, userName) => {
	return new Promise((resolve, reject) => {

		let handle;

		if(userKey && userName){

			requestDatabaseHandle()
			.then((res) => {

				handle = res;
				if(!handle) throw 'unable to connect to database';

				// remove all non-core user data first
				// - for each collection, add another .then to the promise chain
				return deleteUserDemoData(handle, userKey);
			})
			.then((res) =>  {
				returnDatabaseHandle(handle); 
				return deleteUserByNameAction(userName);
			})
			.then((res) => resolve(true))
			.catch((err) => { 
				catchHandleHelper(err, handle); 
				resolve(false); 
			});
		}
		else resolve(false);
	});
};


const deleteUser = (key) => {
	return new Promise((resolve, reject) => {

		if(key){

			getUser({key: key})
			.then((res) => {

				if(!res || !res.user || !res.user._key || !res.user.userName) throw 'user not found';

				return deleteAllUserData(res.user._key, res.user.userName)
			})
			.then((res) => resolve(true))
			.catch((err) => {
				console.log('deleteUser error', err);
				resolve(false);
			});
		}
		else resolve(false);
	});
};


const _createArchive = `
	INSERT {
		_key: @key,
		archive: @archive,
		createdOn: @createdOn
	} IN UserArchives
	RETURN NEW`;
const _createArchivedUser = `
	INSERT {
		_key: @key,
		userName: @name,
		isArchived: true,
		isActive: false,
		createdOn: @createdOn
	} IN Users`;

const createArchive = (archive, userName, userKey) => {
	return new Promise((resolve, reject) => {

		let handle,
			now = moment().utc().toISOString();

		if(userName && archive && userKey){

			requestDatabaseHandle()
			.then((res) => {

				handle = res;
				if(!handle) throw 'unable to connect to database';

				return handle.query({
					query: _createArchivedUser,
					bindVars: {
						key: userKey,
						name: userName,
						createdOn: now
					}
				});
			})
			.then((cursor) => cursor.all())
			.then((res) => {

				return handle.query({
					query: _createArchive,
					bindVars: {
						key: userName,
						archive: archive,
						createdOn: now
					}
				});
			})
			.then((cursor) => cursor.all())
			.then((res) => resolve(resolveFirstResultOnly(handle, res)))
			.catch((err) => { 
				catchHandleHelper(err, handle); 
				resolve(false); 
			});
		}
		else resolve(false);
	});
};


const _deleteArchive = `
	FOR a IN UserArchives
		FILTER a._key == @name
		REMOVE a IN UserArchives
		RETURN OLD`;

const deleteArchive = (userName) => {
	return new Promise((resolve, reject) => {

		let handle;

		if(userName){

			requestDatabaseHandle()
			.then((res) => {

				handle = res;
				if(!handle) throw 'unable to connect to database';

				return handle.query({
					query: _deleteArchive,
					bindVars: {
						name: userName,
					}
				});
			})
			.then((cursor) => cursor.all())
			.then((res) => resolve(resolveFirstResultOnly(handle, res)))
			.catch((err) => { 
				catchHandleHelper(err, handle); 
				resolve(false);
			});
		}
		else resolve(false);
	});
};


const _retrieveArchive = `
	FOR a IN UserArchives
		FILTER a._key == @name
		RETURN a`;

const retrieveArchive = (userName) => {
	return new Promise((resolve, reject) => {
		let handle;

		if(userName){

			requestDatabaseHandle()
			.then((res) => {

				handle = res;
				if(!handle) throw 'unable to connect to database';

				return handle.query({
					query: _retrieveArchive,
					bindVars: {
						name: userName,
					}
				});
			})
			.then((cursor) => cursor.all())
			.then((res) => resolve(resolveFirstResultOnly(handle, res)))
			.catch((err) => { 
				catchHandleHelper(err, handle); 
				resolve(false);
			});
		}
		else resolve(false);
	});
};


module.exports = {
	createArchive,
	deleteArchive,
	retrieveArchive,

	getAllUserData,
	deleteAllUserData,

	deleteUser,
};
