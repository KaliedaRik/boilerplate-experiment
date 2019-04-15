// fetch api polyfill is already included as part of create-react-app

import * as devApi from './z-dev-api-env.js';
import * as prodApi from './z-prod-api-env.js';

import * as devSite from './z-dev-site-env.js';
import * as prodSite from './z-prod-site-env.js';

const getApiEnvironmentVariables = () => {
	if(window.location.host === devSite.siteUrl){
		return devApi;
	}
	else{
		return prodApi;
	}
};

const getSiteEnvironmentVariables = () => {
	if(window.location.host === devSite.siteUrl){
		return devSite;
	}
	else{
		return prodSite;
	}
};

const addToHeader = (key, value, header = null, set = true) => {

	if(!header){
		header = new Headers();
	}

	if(key){
		if(set){
			try{
				header.set(key, value);
			} catch(e){}
		}
		else{
			try{
				header.append(key, value);
			} catch(e){}
		}
	}

	return header;
};

const buildHeaders = (items = {}) => {

	let headers = new Headers(),
		item;

	// username needs to appear in header if user is currently logged in
	item = items['User-Key'] || items.username || '';
	if(item){
		headers = addToHeader('User-Key', item, headers, true);
	}

	// authorization token needs to be present for logged-in users
	item = items.Authorization || items.token || items.auth || '';
	if(item){
		headers = addToHeader('Authorization', `Bearer ${item}`, headers, true);
	}

	// localization can happen in the headers or the body
	item = items['Accept-Language'] || items.locale || siteEnv.defaultLocale;
	if(apiEnv.localeList.indexOf(item) < 0) {
		item = siteEnv.defaultLocale;
	}
	if(item){
		headers = addToHeader('Accept-Language', item, headers, true);
	}

	// origin
	headers = addToHeader('Origin', `${siteEnv.siteProtocol}://${siteEnv.siteUrl}`, headers, true);

	return headers;
};

const buildInput = (items = {}) => {

	let endpoint = items.endpoint || items.url || '',
		url = '';

	if(endpoint){

		if(endpoint.indexOf(apiEnv.apiUrl) === 0){
			url = `${apiEnv.apiProtocol}://${endpoint}`;
		}
		else if(endpoint.indexOf(apiEnv.apiProtocol) === 0){
			url = endpoint;
		}
		else if(endpoint.indexOf('/') === 0){
			url = `${apiEnv.apiProtocol}://${apiEnv.apiUrl}${endpoint}`;
		}
		else{
			url = `${apiEnv.apiProtocol}://${apiEnv.apiUrl}/${endpoint}`;
		}
	}

	return url;
};

const buildInit = (items = {}, init = {}) => {

	init.headers = buildHeaders(items);

	if(items.mode){
		init.mode = items.mode;
	}

	if(items.credentials){
		init.credentials = items.credentials;
	}

	if(items.cache){
		init.cache = items.cache;
	}

	if(items.redirect){
		init.redirect = items.redirect;
	}

	if(items.referrer){
		init.referrer = items.referrer;
	}

	if(items.referrerPolicy){
		init.referrerPolicy = items.referrerPolicy;
	}

	if(items.integrity){
		init.integrity = items.integrity;
	}

	if(typeof items.keepalive === 'boolean'){
		init.keepalive = items.keepalive;
	}

	if(items.signal){
		init.signal = items.signal;
	}

	return init;
};

const doFetch = (items = {}, method = 'GET') => {
	return new Promise ((resolve, reject) => {

		let input = buildInput(items),
			init = {},
			result = {};

		if(input){

			init.method = method;

			init = buildInit(items, init);

			if(method === 'POST' || method === 'PUT'){
				init.headers = addToHeader('Content-Type', 'application/json', init.headers, true);
				init.headers = addToHeader('Accept', 'application/json', init.headers, true);

				let b = items.body || {};
				init.body = JSON.stringify(b);

			}

			fetch(input, init)
			.then((res) => {
				result.status = res.status;

				return res.json();
			})
			.then((res) => {

				result.error = res.error;
				result.message = res.message;
				result.packet = res.packet;

				resolve(result);
			})
			.catch((err) => {
				reject(new Error('_FETCHAPIERROR'));
			});
		}
		else {
			reject(new Error('_FETCHENDPOINTERROR'));
		}
	});
};


/*
The four METHOD functions require an Object argument with the following attributes. None of the attributes are required, except one of 'endpoint' or 'url' must include the api endpoint/url where the request is to be sent. Note that 'User-Key'/'username' are synonyms, as are 'Authorization'/'token'/'auth', and 'Accept-Language'/'locale'

	'User-Key'			// String - username, for api calls requiring it
	username

	Authorization 		// String - authorization token, for api calls requiring it
	token
	auth

	'Accept-Language' 	// String - locale code
	locale

	endpoint 			// String - api endpoint, or full url [required]
	url

	body 				// Object - containing data to be submitted for POST and PUT calls

	mode 				// standard Fetch API Request attributes
	credentials
	cache
	redirect
	referrer
	referrerPolicy
	integrity
	keepalive

The fetch function will return a resolved object containing the following attributes:

	status 				// String - Fetch response status code
	error 				// Number - api response error code (0 for good returns; >0 for errors)
	message 			// String - api response error message
	packet 				// Object - containing data retrieved from api

... or, if something goes wrong, it will reject with an error object containing a message attribute

*/

export {
	getApiEnvironmentVariables, 
	getSiteEnvironmentVariables, 
	doFetch
}

var apiEnv = getApiEnvironmentVariables();
var siteEnv = getSiteEnvironmentVariables();
