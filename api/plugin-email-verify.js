const eVerifier = require('email-verify');

// verify email exists
const verifyEmail = (email) => {
	return new Promise((resolve, reject) => {

		eVerifier.verify(email, (err, info) => {
			if(err){
				resolve(false);
			}
			resolve(info.success);
		});
	});
};

module.exports = {
	verifyEmail,
};
