const common = {
	email: 'Yer flag',
	locale: 'Yer lingo',
	locales: {
		en: 'King\'s lingo',
		xp: 'Free lingo'
	},
	password: 'Yer secret',
	recoveryPhrase: 'Secret verse',
	name: 'Yer mark',

	_FETCHERROR: 'Oops!? Try again!',
	_FORMFIELDSERROR: 'Check yer sribbles and try again',
	_FETCHAPIERROR: 'Oops!? Try again!',
	_FETCHENDPOINTERROR: 'Oops!? Try again!',
	_UPDATEERROR: 'Oops!? Try again!',
};

const xp = {

	BaseNavigation: {
		privacy: 'Yer pers\'nal stash an\' stuff',
	},

	ForgottenPasswordForm: {
		action: 'Parlay secret',
		user: 'Yer secret, or secret verse',
		topHeader: 'Mischarted Secret chitty',
	},

	Home: {
		topHeader: (item) => `Ahoy, ${(item) ? item : 'Mate'} - belay that sail!`,
		body: 'This be the docking berth for crew mates.',
	},

	LoginForm: {
		action: 'Come aboard',
		forgottenPassword: 'Missin\' yer secret? Go parlay a new one.',
		password: common.password,
		register: 'Being press-ganged? Mark up yer contract access chitty',
		topHeader: 'Comin\' aboard chitty!',
		user: 'Yer mark, or yer flag',
	},

	LogoutAction: {
		button: 'Go carousin\'',
	},

	MessageBlock: {
		successHeader: 'Fair winds!',
		warnHeader: 'Storm ahead!',
		errorHeader: 'Shipwrecked!',
	},

	PasswordResetForm: {
		action: 'Contract new secret',
		password: 'Yer new secret',
		topHeader: 'Contract new secret chitty',
	},

	PreferencesForm: {
		action: 'Log chitty',
		email: common.email,
		locale: common.locale,
		locales: common.locales,
		password: common.password,
		recoveryPhrase: common.recoveryPhrase,
		topHeader: 'Plunder chitty!',
		name: common.name,
	},

	Privacy: {
		topHeader: 'Obligatory personal data management and cookies page, in Pirate lingo',
	},

	NotFound: {
		topHeader: (item) => `Ye be stranded in this cursed land, ${(item) ? item : 'Mate'}!`,
	},

	RegisterForm: {
		action: 'Contract access',
		email: common.email,
		locale: common.locale,
		locales: common.locales,
		login: 'Signed up already? Mark up yer comin\' aboard chitty.',
		password: common.password,
		recoveryPhrase: 'Yer secret verse (4 words ye need, or more)',
		topHeader: 'Boarding chitty',
		name: common.name,

		_FETCHERROR: common._FETCHERROR,
		_FORMFIELDSERROR: common._FORMFIELDSERROR,
		_FETCHAPIERROR: common._FETCHAPIERROR,
		_FETCHENDPOINTERROR: common._FETCHENDPOINTERROR,
		_UPDATEERROR: common._UPDATEERROR,
	},

	RegisterEmailMessage: {
		topHeader: 'Ahoy, Mate - ye ready to be press-ganged?',
		body: 'See the flag we sent ye - tap on the X mark to find yer treasures.',
	},

	TopNavigation: {
		home: 'Ship map',
		login: 'Comin\' aboard chitty',
		passwordReset: 'Contract new secret chitty',
		preferences: 'Plunder chitty',
		unknown: 'Stranded map',
		updateVisitorLocale: 'Yer lingo',
		welcome: 'Port map',
	},

	UpdateVisitorLocaleForm: {
		action: 'Log chitty',
		locale: common.locale,
		locales: common.locales,
		topHeader: 'Swap Yer Lingo chitty',
	},

	Welcome: {
		topHeader: 'Ahoy, Mate - ye be carousin\' now!',
		body: 'This be the docking berth for strangers to these shores.',
	},
};

export default xp;
