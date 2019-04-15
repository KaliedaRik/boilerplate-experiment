const { database } = require('./utilities.js').getServerEnvironmentVariables();

const dbUser = require(`./plugin-${database}-user.js`);
const dbArchive = require(`./plugin-${database}-archive.js`);

module.exports = {
	createToken: dbUser.createToken,
	retrieveToken: dbUser.retrieveToken,

	createArchive: dbArchive.createArchive,
	deleteArchive: dbArchive.deleteArchive,
	retrieveArchive: dbArchive.retrieveArchive,

	initializeNewUser: dbUser.initializeNewUser,
	confirmNewUser: dbUser.confirmNewUser,

	recordLogin: dbUser.recordLogin,

	getUser: dbUser.getUser,
	updateUser: dbUser.updateUser,
	updateUserEmail: dbUser.updateUserEmail,

	retrieveAdminKeys: dbUser.retrieveAdminKeys,
	retrieveNonAdminKeys: dbUser.retrieveNonAdminKeys,
	retrieveUserKeys: dbUser.retrieveUserKeys,

	getAllUserData: dbArchive.getAllUserData,
	deleteAllUserData: dbArchive.deleteAllUserData,

	deleteUser: dbArchive.deleteUser,
	deleteUserByNameAction: dbUser.deleteUserByNameAction,
};
