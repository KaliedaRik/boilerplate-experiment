const common = {
	email: 'Email',
	locale: 'Locale',
	locales: {
		en: 'English',
		xp: 'Pirate'
	},
	password: 'Password',
	recoveryPhrase: 'Recovery phrase',
	name: 'Name',

	_FETCHERROR: 'Unexpected error - please try again',
	_FORMFIELDSERROR: 'Please check form for missing ow incomplete data',
	_FETCHAPIERROR: 'Unexpected error - please try again',
	_FETCHENDPOINTERROR: 'Unexpected error - please try again',
	_UPDATEERROR: 'Unexpected error - please try again',
};

const en = {

	BaseNavigation: {
		privacy: 'Personal data and cookies',
	},

	ForgottenPasswordForm: {
		action: 'Request password reset',
		user: 'Either email, or recovery phrase',
		topHeader: 'Forgotten Password form',
	},

	Home: {
		topHeader: (item) => `Hi ${(item) ? item : 'Friend'} - you are logged in`,
		body: 'This is the home/welcome page for users who have successfully logged in.',
	},

	LoginForm: {
		action: 'Login',
		forgottenPassword: 'Forgotten your password? Please complete the forgotten password form.',
		password: common.password,
		register: 'Not a member yet? Please complete the registration form.',
		topHeader: 'Login form',
		user: 'User name, or email',
	},

	LogoutAction: {
		button: 'Logout',
	},

	MessageBlock: {
		successHeader: 'Success!',
		warnHeader: 'Be aware',
		errorHeader: 'Issue detected',
	},

	NotFound: {
		topHeader: (item) => `Page not found, ${(item) ? item : 'my Friend'}!`,
	},

	PasswordResetForm: {
		action: 'Reset password',
		password: 'New password',
		topHeader: 'Reset Password form',
	},

	PreferencesForm: {
		action: 'Update preferences',
		email: common.email,
		locale: common.locale,
		locales: common.locales,
		password: common.password,
		recoveryPhrase: common.recoveryPhrase,
		topHeader: 'Preferences form',
		name: common.name,
	},

	Privacy: {
		topHeader: 'Obligatory personal data management and cookies page',
	},

	RegisterForm: {
		action: 'Register',
		email: 'Email address (not required)',
		locale: common.locale,
		locales: common.locales,
		login: 'Already joined? Please complete the login form.',
		password: common.password,
		recoveryPhrase: 'Recovery phrase (4 words minimum)',
		topHeader: 'Register form',
		name: common.name,

		_FETCHERROR: common._FETCHERROR,
		_FORMFIELDSERROR: common._FORMFIELDSERROR,
		_FETCHAPIERROR: common._FETCHAPIERROR,
		_FETCHENDPOINTERROR: common._FETCHENDPOINTERROR,
		_UPDATEERROR: common._UPDATEERROR,
	},

	RegisterEmailMessage: {
		topHeader: 'You have been registered',
		body: 'We have sent you an email - click on the link in that message to complete your registration.',
	},

	TopNavigation: {
		home: 'Home page',
		login: 'Login form',
		passwordReset: 'Reset password form',
		preferences: 'Preferences form',
		unknown: 'Unknown page',
		updateVisitorLocale: 'Language',
		welcome: 'Welcome page',
	},

	UpdateVisitorLocaleForm: {
		action: 'Update preference',
		locale: common.locale,
		locales: common.locales,
		topHeader: 'Update language form',
	},

	Welcome: {
		topHeader: 'Sorry, Friend - you are logged out',
		body: 'This is the home/welcome page for visitors to the site.',
	},
};

export default en;
