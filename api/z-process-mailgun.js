module.exports = {
	whereAmI: 'process environment',
	whatAmI: 'mailgun credentials',
	
	mailgunPublicKey: process.env.RWB_MAILGUN_PUBLICKEY,
	mailgunPrivateKey: process.env.RWB_MAILGUN_PRIVATEKEY,
	mailgunDomain: process.env.RWB_MAILGUN_DOMAIN,
};
