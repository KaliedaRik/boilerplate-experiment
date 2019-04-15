// server side
const { localeList } = require('./utilities.js').getServerEnvironmentVariables();

// client side
// import { getApiEnvironmentVariables } from './utilities.js';
// const localeList = getApiEnvironmentVariables();

// ---------------------------------------------------------------------- //

const common = {

	email: {
		required: true,
		regex: /.+?@.+?\..+/
	},

	key: {
		required: true,
	},

	locale: {
		required: true,
		isIncludedIn: localeList
	},

	name: {
		required: true,
		minLength: 6
	},

	otpToken: {
		required: true,
		regex: /^........-....-....-....-............$/
	},

	password: {
		required: true,
		minLength: 6
	},

	token: {
		required: true,
		minLength: 24
	},

	twofaToken: {
		required: true,
		minLength: 6,
		maxLength: 6
	},

	user: {
		required: true,
		minLength: 6
	},

	userIsSelf: {
		required: true,
		isBoolean: true
	},

	userName: {
		required: true,
		minLength: 8
	},
};

// ---------------------------------------------------------------------- //

// locale will be added automatically to all data objects submitted to the api
// - thus locale needs to be added to validations to prevent unnecessary rejections

// CORE SYSTEM (USER-RELATED) VALIDATIONS

const putArchive = {
	key: common.key,
	userName: common.userName,
	userIsSelf: common.userIsSelf,
};

const postArchive = {
	locale: {},
	user: common.user,
	password: common.password,
};

const putConfirmEmail = {
	locale: {},
	user: common.user,
	token: common.otpToken,
};

const putLogin = {
	locale: {},
	user: common.user,
	password: common.password,
};

const postRecover = {
	locale: {},
	phrase: {},
	user: common.user,
};

const putRecover = {
	locale: {},
	password: common.password,
	token: common.otpToken,
	user: common.user,
};

const postRegister = {
	name: common.name,
	password: common.password,
	locale: common.locale,
	email: {},
	recoveryPhrase: {},
};

const putRegister = {
	locale: {},
	user: common.user,
	token: common.otpToken,
};

const getToken = {
	userName: common.userName,
};

const getTwofa = {
	userName: common.userName,
};

const postTwofa = {
	token: common.twofaToken,
	userName: common.userName,
};

const putTwofa = {
	token: common.twofaToken,
	userName: common.userName,
};

const deleteUser = {
	key: common.key,
	userName: common.userName,
	userIsSelf: common.userIsSelf,
};

const putUser = {
	userName: common.userName,
	name: {},
	password: {},
	locale: {},
	email: {},
	recoveryPhrase: {},
	twofaIsEnabled: {},
};

const putUserAuth = {
	key: common.key,
	userName: common.userName,
	isAdministrator: {},
	canArchiveOtherUsers: {},
	canDeleteOtherUsers: {},
};

// ---------------------------------------------------------------------- //

// server side
module.exports = {
	putArchive,
	postArchive,
	putConfirmEmail,
	putLogin,
	postRecover,
	putRecover,
	postRegister,
	putRegister,
	getToken,
	getTwofa,
	postTwofa,
	putTwofa,
	deleteUser,
	putUser,
	putUserAuth,
};

// client side
// export {
// 	putArchive,
// 	postArchive,
// 	putConfirmEmail,
// 	putLogin,
// 	postRecover,
// 	putRecover,
// 	postRegister,
// 	putRegister,
// 	getToken,
// 	getTwofa,
// 	postTwofa,
// 	putTwofa,
// 	deleteUser,
// 	putUser,
// 	putUserAuth,
// };
