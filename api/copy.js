const copy = {
	en: require('./locales/en-copy.js'),
	xp: require('./locales/xp-copy.js'),
};

const templates = {
	en: require('./locales/en-email-templates.js'),
	xp: require('./locales/xp-email-templates.js'),
}

// ---------------------------------------------------------------------- //

const getCopy = (section, locale, defaultLocale) => {

	let keys;

	if(!section) return {};

	locale = (locale) ? locale : defaultLocale;
	keys = Object.keys(copy);

	return (keys.indexOf(locale) < 0) ? {} : copy[locale][section];
};

const getTemplates = (template, locale, defaultLocale) => {

	let keys;

	if(!template) return {};

	locale = (locale) ? locale : defaultLocale;
	keys = Object.keys(templates);

	return (keys.indexOf(locale) < 0) ? {} : templates[locale][template];
};

// ---------------------------------------------------------------------- //

module.exports = {
	getCopy,
	getTemplates,
};
