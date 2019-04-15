// TODO: move from SHA1 to SHA2
// - https://github.com/speakeasyjs/speakeasy
// - defaults to SHA1; probably want to move this to SHA2 (specifically SHA256)
// - also decide whether the secret should be encrypted when saved to database? (which we can then decrypt to get original value)
// - if yes to above, assume the same treatment for the image?

const speakeasy = require("speakeasy");
const qrcode = require('qrcode');

const SECRET_LENGTH = 20;	// HARDCODED magic value - ought to be set in a z- environment variable

// get a fresh 2fa key and imageUrl
const makeTwofaCodes = () => {
	return new Promise((resolve, reject) => {

		let secret;

		// Promise.resolve(true)
		// .then(() => {

			secret = speakeasy.generateSecret({
				length: SECRET_LENGTH
			});

			// return generateImageUrl(secret.otpauth_url);
		// })
		generateImageUrl(secret.otpauth_url)
		.then((url) => {

			if(!url) resolve(false);

			resolve({
				secret: secret.base32,
				image: url
			});
		})
		.catch((err) => resolve(false));
	});
};

const generateImageUrl = (url) => {
	return new Promise((resolve, reject) => {

		qrcode.toDataURL(url, function(err, data_url) {

			if(err) resolve(false);
			
			resolve(data_url);
		});
	});
};

const generateTwofaToken = (secret) => {
	return new Promise((resolve, reject) => {

		let token = speakeasy.totp({
			secret: secret,
			encoding: 'base32'
		});

		resolve(token);
	});
};

const verifyTwofaToken = (secret, token) => {
	return new Promise((resolve, reject) => {

		let verified = speakeasy.totp.verify({ 
			secret: secret,
			encoding: 'base32',
			token: token 
		});

		resolve(verified);
	});
};

module.exports = {
	generateTwofaToken,
	makeTwofaCodes,
	verifyTwofaToken,
};
