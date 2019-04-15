const mailgun = require('mailgun.js');
const mustache = require('mustache');

const { 
	getCopy, 
	getTemplates } = require('./copy.js');


// get environment variables suitable for current environment
const getMailgunEnvironmentVariables = () => {

	if(process.env.MYENVIRONMENT === 'dev'){
		return require('./z-dev-mailgun-env.js');
	}
	else{
		return require('./z-prod-mailgun-env.js');

		// alternative file for retrieving env vars from server process.env values
		// return require('./z-process-mailgun.js');
	}
};

const { defaultLocale } = require('./utilities.js').getServerEnvironmentVariables();
const { mailgunPrivateKey, mailgunDomain } = getMailgunEnvironmentVariables();

// NOTE - as a rule, utility promises prefer to resolve false on errors, rather than reject
// ------------------------------------------------------------------------------------------

// system emails
const postSystemEmail = (template, view, recipients, locale) => {

	return new Promise((resolve, reject) => {
		
		let copy = getCopy('systemEmail', locale, defaultLocale),
			templates = getTemplates(template, locale, defaultLocale),
			subject = templates.subject,
			html = templates.html,
			text = templates.text,
			renderedHtml, renderedText,
			mg, packet;

		renderedText = mustache.render(text, view);
		renderedHtml = mustache.render(html, view);

		mg = mailgun.client({
			username: 'api', 
			key: mailgunPrivateKey
		});

		packet = {
			from: `${copy.teamName} <hello@rikworks.co.uk>`,  // HARDCODED DATA that needs to be separated out into a Z- file
			to: recipients,
			subject: subject,
			text: renderedText,
			html: renderedHtml
		};

		mg.messages.create(mailgunDomain, packet)
		.then((msg) => {
			resolve(true);
		})
		.catch((err) => {
			console.log(err);
			resolve(false);
		});
	});
};

// ---------------------------------------------------------------------- //

module.exports = {
	getMailgunEnvironmentVariables,		// don't need to export this function
	postSystemEmail,
};
