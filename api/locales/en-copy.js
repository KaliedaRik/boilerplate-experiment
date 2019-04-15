module.exports = {

	index: {
		'101:OK_BASIC':  					'All is good',
		'102:OK_AUTHORIZED':  				'User is authorized',
		'103:EMAIL_SENT':  					'Check inbox for email',
		'104:OK_REGISTER':  				'New user registered and authorized',
		'105:OK_RECOVER':  					'Recovery one-time code supplied',
		'106:OK_USER_UPDATED':  			'User details updated',
		'107:OK_DELETED_EMAIL_WARNING':  	'User details updated - email data deleted, so will need a recovery phrase for password recovery requests',
		'108:OK_UPDATED_EMAIL_WARNING':  	'User details updated - email update will not take effect until sent email has been acknowledged',
		'109:OK_EMAIL_UPDATED':  			'User email details updated',
		'110:OK_2FA_DATA':  				'User two factor authentication details',
		'111:OK_2FA_LOGIN':  				'Two factor authentication token must be supplied to complete login',
		'112:OK_TOKEN_REFRESHED':  			'User token refreshed',
		'113:OK_PASSWORD':  				'User is authorized with new password',
		'114:OK_OTHER_USER_UPDATED':  		'User details updated',

		'601:OK_USER_ARCHIVED':  			'User successfully archived',
		'602:OK_USER_UNARCHIVED':  			'User successfully unarchived',
		'603:OK_USER_DELETED':  			'User successfully deleted',
		'604:OK_ARCHIVE': 		 			'User data archive retrieved',

		'1001:ERROR_DATA':  				'Insufficient data supplied',
		'1002:ERROR_DATA_VALIDATION':  		'Data failed validation',
		'1003:ERROR_LOGIN':  				'Login failed',
		'1004:ERROR_TOKEN':  				'Access token not recognised',
		'1005:ERROR_AUTHORIZATION':  		'Authorization error',
		'1006:ERROR_EMAIL_BAD':  			'Email address does not exist',
		'1007:ERROR_DUPLICATE_USER':  		'User with that email already registered',
		'1008:ERROR_DUPLICATE_LOGIN':  		'User already logged in',
		'1009:ERROR_USER_INACTIVE':  		'User registered but not recorded as active',
		'1010:ERROR_TOKEN_STALE':  			'Access token stale',
		'1011:ERROR_ARCHIVE_MISMATCH':  	'Request to archive user supplied ambiguous data',
		'1012:ERROR_DUPLICATE_ARCHIVE':  	'User is already archived',
		'1013:ERROR_LOGIN_ARCHIVED':  		'Login not possible when user is archived',
		'1014:ERROR_LOGIN_UNARCHIVED':  	'Unarchive not possible when user is not archived',
		'1015:ERROR_DELETE_MISMATCH':  		'Request to delete user supplied ambiguous data',
		'1016:ERROR_TWOFA_INCOMPLETE':  	'Two factor authentication token must be supplied to complete login',
		'1017:ERROR_TWOFA_CLOSED':  		'Two factor authentication window has closed',
		'1018:ERROR_PERMISSIONS_FAIL':  	'Insufficient permissions to perform action',
		'1019:ERROR_ARCHIVE':  				'Request to generate archive data failed',

		'2001:ERROR_EMAIL_NOT_SENT':  		'Unable to send email',

		'3001:DB_ERROR_INSERTION':  		'Database insertion error',
		'3002:DB_ERROR_UPDATE':  			'Database update error',
		'3003:DB_ERROR_DELETE':  			'Database deletion error',
		'3004:DB_ERROR_USER':  				'Failed to retrieve user',
		'3005:DB_ERROR_KEY':  				'Failed to retrieve user key',

		'4001:ERROR_PASSWORD':  			'Password hashing failed',
		'4002:ERROR_PASSWORD_MISMATCH':  	'Password comparison failed',
		'4003:ERROR_TOKEN_GENERATION':  	'Token generation failed',
		'4004:ERROR_TOKEN_DECRYPTION':  	'Token decryption failed',

		'9001:SYSTEM_ERROR':  				'Unable to process request',
	},

	systemEmail: {
		teamEmail:  						'hello@YOUR.EMAIL.DOMAIN',		// HARDCODED DATA that needs to be separated out into a Z- file?
		teamName: 							'YOUR SUPPORT TEAM NAME',
	},
};
