const moment = require('moment');

const {
	createToken,
	retrieveToken,
	createArchive,
	deleteArchive,
	retrieveArchive,
	getAllUserData,
	deleteAllUserData,
	initializeNewUser,
	confirmNewUser,
	recordLogin,
	getUser,
	updateUser,
	updateUserEmail,
	deleteUser,
	deleteUserByNameAction } = require('./v1-database.js');


const { 
	cascadeHead,
	checkPassword,
	encryptPassword, 
	getServerEnvironmentVariables,
	makeToken,
	makeTwofaCodes,
	makeUuid, 
	verifyEmail,
	verifyTwofaToken } = require('./utilities.js');

const { emailer,
	defaultLocale,
	humanAuthTokenExpires, 
	singleUseTokenExpires } = getServerEnvironmentVariables();

const { postSystemEmail } = require(`./plugin-${emailer}.js`);


// EXPORTED FUNCTIONS
// ---------------------------------------------------------------------- //

const actionGetArchive = (userData) => {
	return new Promise((resolve, reject) => {

		getAllUserData(userData.user.userName)
		.then((res) => {
			if(!res) throw '1019:ERROR_ARCHIVE';

			resolve({ 
				resultCode: '604:OK_ARCHIVE' ,
				packet: JSON.stringify(res)
			});
		})
		.catch((err) => reject(createErrorPacket(err)));
	});
};

const actionPostArchive = (data) => {
	return new Promise((resolve, reject) => {

		resolve(false);

		// let usr;

		// /.+?@.+?\..+/.test(data.user) ? 
		// 	data.email = data.user :
		// 	data.userName = data.user;

		// getUser(data)
		// .then((res) => {
		// 	if(!res) throw '3004:DB_ERROR_USER';

		// 	usr = res;
		// 	if(!usr.isArchived) throw '1014:ERROR_LOGIN_UNARCHIVED';
			
		// 	if(data.user === usr.userName || data.user === usr.email){

		// 		attemptLogin(data.password, usr)
		// 		.then((res) => {
		// 			if(!res) throw '3004:DB_ERROR_USER';

		// 			return doUnarchive(usr);
		// 		})
		// 		.then((res) => {
		// 			if(!res) throw '3002:DB_ERROR_UPDATE';

		// 			return unArchiveUserAction(usr._key);
		// 		})
		// 		.then((res) => {
		// 			if(!res) throw '3002:DB_ERROR_UPDATE';

		// 			return updateUserDataOnLogin(res, '602:OK_USER_UNARCHIVED');
		// 		})
		// 		.then((res) => {
		// 			if(!res) throw '3002:DB_ERROR_UPDATE';

		// 			resolve(res)
		// 		})
		// 		.catch((err) => reject(createErrorPacket(err)));
		// 	}
		// 	else throw '1001:ERROR_DATA';
		// })
		// .catch((err) => reject(createErrorPacket(err)));
	});
};

const actionPutArchive = (data, actor) => {
	return new Promise((resolve, reject) => {

		let target, targetKey, targetName, actorKey, archive;

		getUser({ key: data.key })
		.then((res) => {
			if(!res) throw '3005:DB_ERROR_KEY';

			if(res && res.user && res.user.isArchived) throw '1012:ERROR_DUPLICATE_ARCHIVE';

			target = res;
			targetKey = target.user._key;
			targetName = target.user.userName;
			actorKey = actor.user._key;

			if(data.userIsSelf && targetKey === actorKey){
				return getAllUserData(targetName);
			}
			else if(!data.userIsSelf && targetKey !== actorKey){

				if(!actor.auths.canArchiveOtherUsers) throw '1018:ERROR_PERMISSIONS_FAIL';

				return getAllUserData(targetName);
			}
			else throw '1011:ERROR_ARCHIVE_MISMATCH';
		})
		.then((res) => {
			if(!res) throw '1019:ERROR_ARCHIVE';

			archive = JSON.stringify(res);

			return deleteAllUserData(targetKey, targetName);
		})
		.then((res) => {
			if(!res) throw '3003:DB_ERROR_DELETE';

			return createArchive(archive, targetName, targetKey);
		})
		.then((res) => {
			if(!res) throw '3001:DB_ERROR_INSERTION';

			resolve({ resultCode: '601:OK_USER_ARCHIVED' });
		})
		.catch((err) => reject(createErrorPacket(err)));
	});
};

const actionDeleteUser = (data, actor) => {
	return new Promise((resolve, reject) => {

		let target, targetKey, targetName, actorKey, archive;

		getUser({ key: data.key })
		.then((res) => {
			if(!res) throw '3005:DB_ERROR_KEY';

			target = res;
			targetKey = target.user._key;
			targetName = target.user.userName;
			actorKey = actor.user._key;

			if(data.userIsSelf && targetKey === actorKey){
				return getAllUserData(targetName);
			}
			else if(!data.userIsSelf && targetKey !== actorKey){

				if(!actor.auths.canDeleteOtherUsers) throw '1018:ERROR_PERMISSIONS_FAIL';

				if(target.user.isArchived){
					return {};
				}
				else{
					return getAllUserData(targetName);
				}
			}
			else throw '1011:ERROR_ARCHIVE_MISMATCH';
		})
		.then((res) => {
			if(!res) throw '1019:ERROR_ARCHIVE';

			archive = JSON.stringify(res);

			return deleteAllUserData(targetKey, targetName);
		})
		.then((res) => {
			if(!res) throw '3003:DB_ERROR_DELETE';

			resolve({ 
				resultCode: '603:OK_USER_DELETED',
				data: archive 
			});
		})
		.catch((err) => reject(createErrorPacket(err)));
	});
};


module.exports = {
	actionDeleteUser,
	actionGetArchive,
	actionPostArchive,
	actionPutArchive,
};
