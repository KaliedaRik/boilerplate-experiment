const moment = require('moment');

const { 
	catchHandleHelper,
	getFirstResultOnly,
	requestDatabaseHandle,
	resolveFirstResultOnly,
	returnDatabaseHandle } = require('./plugin-arangodb-connection.js');

const { 
	defaultLocale,
	singleUseTokenExpires } = require('./utilities.js').getServerEnvironmentVariables();


// helper functions
// --------------------------------------------------------------------------------------------------

const _generateUserName = `
FOR u IN Users
	FILTER u.userName =~ @name
	RETURN u.userName`;

// need to figure out a way to include archived users in this calculation
const generateUserName = (name) => {
	return new Promise((resolve, reject) => {

		let username, n, search, 
			maxUsr, usr, tempArr, i, iz;

		n = name.toLowerCase();
		n = n.replace(/ /g, '.');
		n = n.replace(/@/g, '-');
		search = `^${n}`;

		requestDatabaseHandle()
		.then((res) => {

			handle = res;
			if(!handle) throw 'unable to connect to database';

			return handle.query({
				query: _generateUserName,
				bindVars: {
					name: n
				}
			});
		})
		.then((cursor) => cursor.all())
		.then((res) => {

			if(res && res.length){
				maxUsr = 1;
				for(i = 0, iz = res.length; i < iz; i++){
					tempArr = res[i].split('.');
					usr = parseInt(tempArr[tempArr.length - 1], 10);
					maxUsr = (usr > maxUsr) ? usr : maxUsr;
				}
				username = `${n}.${maxUsr + 1}`;
			}
			else username = `${n}.1`;

			returnDatabaseHandle(handle);
			resolve((username) ? username : false)
		})
		.catch((err) => { 
			catchHandleHelper(err, handle); 
			resolve(false); 
		});
	});
};


const _deleteUserByNameAction1 = `
	FOR u IN Users
  		FILTER u.userName == @name
  		REMOVE u IN Users
  		RETURN OLD`;
const _deleteUserByNameAction2 = `
	FOR t IN UserTokens
		FILTER t.userName == @name
		REMOVE t IN UserTokens`;
const _deleteUserByNameAction3 = `
	FOR s IN UserSecrets
		FILTER s._key == @key
		REMOVE s IN UserSecrets`;
const _deleteUserByNameAction4 = `
	FOR z IN UserAuths
		FILTER z._key == @key
		REMOVE z IN UserAuths`;
const _deleteUserByNameAction5 = `
	FOR a IN UserArchives
		FILTER a._key == @name
		REMOVE a IN UserArchives`;

const deleteUserByNameAction = (userName) => {

	return new Promise((resolve, reject) => {

		let handle, user;

		if(userName){
			requestDatabaseHandle()
			.then((res) => {

				handle = res;
				if(!handle) throw 'unable to connect to database';

				return handle.query({
					query: _deleteUserByNameAction1,
					bindVars: {
						name: userName,
					}
				});
			})
			.then((cursor) => cursor.all())
			.then((res) => {
				user = res[0];
				return handle.query({
					query: _deleteUserByNameAction2,
					bindVars: {
						name: userName,
					}
				});
			})
			.then((cursor) => cursor.all())
			.then((res) => {
				return handle.query({
					query: _deleteUserByNameAction3,
					bindVars: {
						key: user._key,
					}
				});
			})
			.then((cursor) => cursor.all())
			.then((res) => {
				return handle.query({
					query: _deleteUserByNameAction4,
					bindVars: {
						key: user._key,
					}
				});
			})
			.then((cursor) => cursor.all())
			.then((res) => {
				return handle.query({
					query: _deleteUserByNameAction5,
					bindVars: {
						name: userName,
					}
				});
			})
			.then((cursor) => cursor.all())
			.then((res) => { 
				returnDatabaseHandle(handle); 
				resolve(true); 
			})
			.catch((err) => { 
				catchHandleHelper(err, handle); 
				resolve(false);
			});
		}
	});
};


const _getUserByKey = `
	FOR u IN Users
		FILTER u._key == @key
		FOR s IN UserSecrets
			FILTER s._key == u._key
		FOR a IN UserAuths
			FILTER a._key == u._key
		RETURN {
			user: u,
			auths: a,
			secrets: s
		}`;

const getUserByKey = (handle, key) => {
	return new Promise((resolve, reject) => {

		if(handle && handle.query && key){
			handle.query({
				query: _getUserByKey,
				bindVars: {
					key: key
				}
			})
			.then((cursor) => cursor.all())
			.then((res) => {
				resolve(getFirstResultOnly(res))
			})
			.catch((err) => resolve(false));
		}
		else resolve(false);
	});
};


const _getUserByUserName = `
	FOR u IN Users
		FILTER u.userName == @userName
		FOR s IN UserSecrets
			FILTER s._key == u._key
		FOR a IN UserAuths
			FILTER a._key == u._key
		RETURN {
			user: u,
			auths: a,
			secrets: s
		}`;

const getUserByUserName = (handle, userName) => {
	return new Promise((resolve, reject) => {

		if(handle && handle.query && userName){
			handle.query({
				query: _getUserByUserName,
				bindVars: {
					userName: userName
				}
			})
			.then((cursor) => cursor.all())
			.then((res) => resolve(getFirstResultOnly(res)))
			.catch((err) => resolve(false));
		}
		else resolve(false);
	});
};


const _getUserByEmail = `
	FOR u IN Users
		FILTER u.email == @email
		FOR s IN UserSecrets
			FILTER s._key == u._key
		FOR a IN UserAuths
			FILTER a._key == u._key
		RETURN {
			user: u,
			auths: a,
			secrets: s
		}`;

const getUserByEmail = (handle, email) => {
	return new Promise((resolve, reject) => {

		if(handle && handle.query && email){
			handle.query({
				query: _getUserByEmail,
				bindVars: {
					email: email
				}
			})
			.then((cursor) => cursor.all())
			.then((res) => resolve(getFirstResultOnly(res)))
			.catch((err) => resolve(false));
		}
		else resolve(false);
	});
};


const getUserByToken = (handle, token) => {
	return new Promise((resolve, reject) => {

		if(handle && handle.query && token){
			retrieveToken(token)
			.then((userName) => {
				if(!userName) throw 'token not found';

				return getUserByUserName(handle, userName);
			})
			.then((res) => resolve(res))
			.catch((err) => resolve(false));
		}
		else resolve(false);
	});
};


// exported functions
// --------------------------------------------------------------------------------------------------

const getUser = (items) => {

	return new Promise((resolve, reject) => {

		if(items != null && typeof items === 'object'){

			let key = items.key || items._key || false,
				userName = items.userName || false,
				token = items.token || false,
				email = items.email || false,
				handle;

			if(key || userName || token || email){

				requestDatabaseHandle()
				.then((res) => {

					handle = res;
					if(!handle) throw 'unable to connect to database';

					// NOTE: order of if statements is important!
					if(key){
						return getUserByKey(handle, key);
					}

					if(userName){
						return getUserByUserName(handle, userName);
					}

					if(token){
						return getUserByToken(handle, token);
					}

					if(email){
						return getUserByEmail(handle, email);
					}
				})
				.then((res) => {

					if(!res) throw 'no user returned';

					returnDatabaseHandle(handle);
					resolve(res);
				})
				.catch((err) => { catchHandleHelper(err, handle); resolve(false); });
			}
			else resolve(false);
		}
		else resolve(false)
	});
};


const _createToken = `
	INSERT {
		_key: @token,
		userName: @userName,
		expires: @expires
	} IN UserTokens
	RETURN NEW`;

const createToken = (token, userName) => {
	return new Promise((resolve, reject) => {

		let handle;

		if(token && userName){

			requestDatabaseHandle()
			.then((res) => {

				handle = res;
				if(!handle) throw 'unable to connect to database';

				return handle.query({
					query: _createToken,
					bindVars: {
						token: token,
						userName: userName,
						expires: moment().utc().add(singleUseTokenExpires, 'hours').toISOString()
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


const _retrieveToken = `
	FOR t IN UserTokens
		FILTER t._key == @token
	    REMOVE t IN UserTokens
	RETURN OLD.userName`;

const retrieveToken = (token) => {
	return new Promise((resolve, reject) => {

		let handle;

		if(token){

			requestDatabaseHandle()
			.then((res) => {

				handle = res;
				if(!handle) throw 'unable to connect to database';

				return handle.query({
					query: _retrieveToken,
					bindVars: {
						token: token
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


const _initializeNewUser_Users = `
	INSERT {
		name: @name,
		userName: @userName,
		locale: @locale,
		email: @email,
		twofaIsEnabled: @twofaIsEnabled,
		isHuman: @isHuman,
		isActive: @isActive,
		isArchived: @isArchived,
		createdOn: @createdOn,
		updatedOn: @updatedOn
	} IN Users
	RETURN NEW`;
const _initializeNewUser_UserAuths = `
	INSERT {
		_key: @key,
		isAdministrator: @isAdministrator,
		canArchiveOtherUsers: @canArchiveOtherUsers,
		canDeleteOtherUsers: @canDeleteOtherUsers,
		createdOn: @createdOn,
		updatedOn: @updatedOn
	} IN UserAuths
	RETURN NEW`;
const _initializeNewUser_UserSecrets = `
	INSERT {
		_key: @key,
		hash: @hash,
		recoveryHash: @recoveryHash,
		tokenSecret: @tokenSecret,
		twofaCode: @twofaCode,
		twofaImage: @twofaImage,
		createdOn: @createdOn,
		updatedOn: @updatedOn
	} IN UserSecrets
	RETURN NEW`;

const initializeNewUser = (items) => {
	return new Promise((resolve, reject) => {

		let handle, userName, user, now;

		if(items && items.name && items.hash && items.tokenSecret && items.twofaCode){

			// TODO: need a check somewhere that will force the first user registered to be administrator with full archive/delete rights
			// there needs to be a minimum count of 1 user with admin rights at all times
			// - and test this

			generateUserName(items.name)
			.then((res) => {

				userName = res;
				return requestDatabaseHandle();
			})
			.then((res) => {

				handle = res;
				if(!handle) throw 'unable to connect to database';

				now = moment().utc().toISOString();

				return handle.query({
					query: _initializeNewUser_Users,
					bindVars: {
						name: items.name,
						userName: userName,
						locale: (items.locale) ? items.locale : defaultLocale,
						email: (items.email) ? items.email : null,
						twofaIsEnabled: false,
						isHuman: (typeof items.isHuman === 'boolean') ? items.isHuman : true,
						isActive: false,
						isArchived: false,
						createdOn: now,
						updatedOn: now
					}
				});
			})
			.then((cursor) => cursor.all())
			.then((res) => {

				user = (res && res[0]) ? res[0] : false;
				if(!user) throw 'unable to create user';

				return handle.query({
					query: _initializeNewUser_UserSecrets,
					bindVars: {
						key: user._key,
						hash: items.hash,
						recoveryHash: (items.recoveryHash) ? items.recoveryHash : null,
						tokenSecret: items.tokenSecret,
						twofaCode: items.twofaCode,
						twofaImage: (items.twofaImage) ? items.twofaImage : null,
						createdOn: now,
						updatedOn: now
					}
				});
			})
			.then((cursor) => cursor.all())
			.then((res) => {

				user = (res && res[0]) ? res[0] : false;
				if(!user) throw 'unable to create user';

				return handle.query({
					query: _initializeNewUser_UserAuths,
					bindVars: {
						key: user._key,
						isAdministrator: (typeof items.isAdministrator === 'boolean') ? items.isAdministrator : false,
						canArchiveOtherUsers: (typeof items.canArchiveOtherUsers === 'boolean') ? items.canArchiveOtherUsers : false,
						canDeleteOtherUsers: (typeof items.canDeleteOtherUsers === 'boolean') ? items.canDeleteOtherUsers : false,
						createdOn: now,
						updatedOn: now
					}
				});
			})
			.then((cursor) => cursor.all())
			.then((res) => {
				return getUserByKey(handle, user._key);
			})
			.then((res) => {
				returnDatabaseHandle(handle); 
				resolve(res);
			})
			.catch((err) => { 
				console.log('initializeNewUser error', err);
				catchHandleHelper(err, handle); 
				resolve(false); 
			});
		} 
		else resolve(false);	
	});
};


const _confirmNewUser = `
	UPDATE @key WITH { 
		tokenExpires: @expires,
		lastLogin: @lastLogin,
		isActive: true,
		updatedOn: @updatedOn
	} IN Users
	RETURN NEW`;

const confirmNewUser = (key, expires) => {
	return new Promise((resolve, reject) => {

		let handle, now;

		if(key && expires){
			requestDatabaseHandle()
			.then((res) => {

				handle = res;
				if(!handle) throw 'unable to connect to database';

				now = moment().utc().toISOString();

				return handle.query({
					query: _confirmNewUser,
					bindVars: {
						key: key,
						expires: expires,
						lastLogin: now,
						updatedOn: now
					}
				});
			})
			.then((cursor) => cursor.all())
			.then((res) => getUserByKey(handle, key))
			.then((res) => {
				returnDatabaseHandle(handle); 
				resolve(res);
			})
			.catch((err) => { 
				console.log('confirmNewUser error', err);
				catchHandleHelper(err, handle); 
				resolve(false); 
			});
		}
		else resolve(false);
	});
};


const _updateUser = `
	UPDATE @id WITH {
		{{FIELD}}: @val,
		updatedOn: @updatedOn
	} IN {{COLLECTION}} OPTIONS { keepNull: false }`;

const updateUser = (items, userKey) => {
	return new Promise((resolve, reject) => {

		if(userKey){

			let checkedKeys = [], 
				i, iz, keys, key,
				now = moment().utc().toISOString(),
				promises = [],
				secretsArray = ['hash', 'recoveryHash', 'tokenSecret', 'twofaCode', 'twofaImage'],
				authsArray = ['isAdministrator', 'canArchiveOtherUsers', 'canDeleteOtherUsers'],
				protectedAttributes = ['_id', '_key', '_rev', 'isHuman', 'isActive', 'isArchived', 'createdOn', 'updatedOn', 'lastLogin', 'tokenExpires', 'twofaTriggered', 'twofaWindowCloses', 'password', 'recoveryPhrase'];

			let action = (db, field, val, id) => {
				return new Promise((resolve, reject) => {

					let template, collection;

					if (secretsArray.indexOf(field) >= 0) {
						collection = 'UserSecrets';
					}
					else if (authsArray.indexOf(field) >= 0) {
						collection = 'UserAuths';
					}
					else {
						collection = 'Users';
					}

					template = _updateUser.replace('{{FIELD}}', field);
					template = template.replace('{{COLLECTION}}', collection);

					db.query({
						query: template,
						bindVars: {
							val: val,
							id: id,
							updatedOn: now
						}
					})
					.then((cursor) => cursor.all())
					.then((res) => resolve(true))
					.catch((err) => resolve(false));
				});
			};

			requestDatabaseHandle()
			.then((res) => {

				handle = res;
				if(!handle) throw 'unable to connect to database';

				keys = Object.keys(items);
				for(i = 0, iz = keys.length; i < iz; i++){
					key = keys[i];
					if(protectedAttributes.indexOf(key) < 0){
						checkedKeys.push(key);
					}
				}

				for(i = 0, iz = checkedKeys.length; i < iz; i++){
					key = checkedKeys[i];
					if(key === 'email'){
						if(items[key]){
							promises.push(action(handle, 'newEmail', items[key], userKey));
						}
						else{
							promises.push(action(handle, 'email', null, userKey));
						}
					}
					else {
						promises.push(action(handle, key, items[key], userKey))
					};
				}

				return Promise.all(promises)
			})
			.then((res) => {
				returnDatabaseHandle(handle);
				resolve(true);
			})
			.catch((err) => { 
				catchHandleHelper(err, handle); 
				resolve(false); 
			});
		}
		else Promise.resolve(false);
	});
};


const _updateUserEmail = `
	FOR u IN Users
		UPDATE @key WITH {
			email: u.newEmail,
			newEmail: null,
			updatedOn: @updatedOn
		} IN Users OPTIONS { keepNull: false }`;

const updateUserEmail = (key) => {
	return new Promise((resolve, reject) => {

		let handle;

		if(key){

			requestDatabaseHandle()
			.then((res) => {

				handle = res;
				if(!handle) throw 'unable to connect to database';

				return handle.query({
					query: _updateUserEmail,
					bindVars: {
						key: key,
						updatedOn: moment().utc().toISOString()
					}
				});
			})
			.then((cursor) => cursor.all())
			.then((res) => {
				returnDatabaseHandle(handle);
				resolve(true);
			})
			.catch((err) => { 
				catchHandleHelper(err, handle); 
				resolve(false); 
			});
		}
		else resolve(false);
	});
};


const _retrieveAdminKeys = `
	FOR u IN UserAuths
		FILTER u.isAdministrator == true
		RETURN u._key`;

const retrieveAdminKeys = () => {
	return new Promise((resolve, reject) => {

		let handle;

		requestDatabaseHandle()
		.then((res) => {

			handle = res;
			if(!handle) throw 'unable to connect to database';

			return handle.query({
				query: _retrieveAdminKeys,
				bindVars: {}
			});
		})
		.then((cursor) => cursor.all())
		.then((res) => {
			returnDatabaseHandle(handle);
			resolve(res);
		})
		.catch((err) => { 
			catchHandleHelper(err, handle); 
			resolve([]); 
		});
	});
};

const _retrieveNonAdminKeys = `
	FOR u IN UserAuths
		FILTER u.isAdministrator == false
		RETURN u._key`;

const retrieveNonAdminKeys = () => {
	return new Promise((resolve, reject) => {

		let handle;

		requestDatabaseHandle()
		.then((res) => {

			handle = res;
			if(!handle) throw 'unable to connect to database';

			return handle.query({
				query: _retrieveNonAdminKeys,
				bindVars: {}
			});
		})
		.then((cursor) => cursor.all())
		.then((res) => {
			returnDatabaseHandle(handle);
			resolve(res);
		})
		.catch((err) => { 
			catchHandleHelper(err, handle); 
			resolve([]); 
		});
	});
};

const _retrieveUserKeys = `
	FOR u IN UserAuths
		RETURN u._key`;

const retrieveUserKeys = () => {
	return new Promise((resolve, reject) => {

		let handle;

		requestDatabaseHandle()
		.then((res) => {

			handle = res;
			if(!handle) throw 'unable to connect to database';

			return handle.query({
				query: _retrieveUserKeys,
				bindVars: {}
			});
		})
		.then((cursor) => cursor.all())
		.then((res) => {
			returnDatabaseHandle(handle);
			resolve(res);
		})
		.catch((err) => { 
			catchHandleHelper(err, handle); 
			resolve([]); 
		});
	});
};


const _recordLogin = `
	UPDATE @key WITH {
		lastLogin: @lastLogin,
		tokenExpires: @expires,
		twofaTriggered: @twofa,
		twofaWindowCloses: @twofaWindow,
		updatedOn: @updatedOn
	} IN Users OPTIONS { keepNull: false }`;

const recordLogin = (key, expires, twofa) => {
	return new Promise((resolve, reject) => {

		let handle,
			now = moment().utc().toISOString(),
			twofaWindow;

		if(key){

			requestDatabaseHandle()
			.then((res) => {

				handle = res;
				if(!handle) throw 'unable to connect to database';

				if(twofa){
					// hard-coding the twofa window to 5 mins from now
					twofaWindow = moment().add(5, 'minutes').utc().toISOString();
				}

				return handle.query({
					query: _recordLogin,
					bindVars: {
						key: key,
						lastLogin: now,
						expires: expires || null,
						twofa: twofa || null,
						twofaWindow: twofaWindow || null,
						updatedOn: now
					}
				});
			})
			.then((cursor) => cursor.all())
			.then((res) => {
				returnDatabaseHandle(handle);
				resolve(true);
			})
			.catch((err) => { 
				catchHandleHelper(err, handle); 
				resolve(false); 
			});
		}
		else resolve(false);
	});
};


module.exports = {
	createToken,
	retrieveToken,

	initializeNewUser,
	confirmNewUser,

	recordLogin,

	getUser,
	updateUser,
	updateUserEmail,

	retrieveAdminKeys,
	retrieveNonAdminKeys,
	retrieveUserKeys,

	deleteUserByNameAction,
};
