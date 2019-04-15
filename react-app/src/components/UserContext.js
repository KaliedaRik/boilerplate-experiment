import React, { Component } from 'react';
import moment from 'moment';

import { doFetch } from '../utilities.js';

import { testForm } from '../validateData.js';

// locale copy needs to happen in components, not here - instead set error messages etc to key strings which can be picked up by component

const UserContext = React.createContext();

const UserConsumer = UserContext.Consumer;

class UserProvider extends Component {

	constructor(props) {
		super(props);


		this.updateStateFromApiPacketData = (items = {}) => {

			let obj = {},
				_state = this.state,
				stateVal, itemVal, i, iz, key,
				keys = Object.keys(items);

			for(i = 0, iz = keys.length; i < iz; i++){
				key = keys[i];
				itemVal = items[key];
				stateVal = _state[key];
				if(itemVal != null && stateVal !== null && itemVal !== stateVal){
					obj[key] = itemVal;
				}
			}

			this.setState(obj);
		};

/*
The four fetch METHOD functions require an Object argument with the following attributes. None of the attributes are required, except one of 'endpoint' or 'url' must include the api endpoint/url where the request is to be sent. Note that 'User-Key'/'username' are synonyms, as are 'Authorization'/'token'/'auth', and 'Accept-Language'/'locale'

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

The Promise-based METHOD functions will return an object (either by resolve or reject) containing the following attributes:

	status 				// String - Fetch response status code
	error 				// Number - api response error code (0 for good returns; >0 for errors)
	message 			// String - api response error message
	packet 				// Object - containing data retrieved from api

*/

		this.callApi = (items = {}, method = 'GET', form = 'nonceform') => {
			return new Promise((resolve, reject) => {

				let test = items.body != null ? testForm(form, items.body) : true;

				if(test){

					doFetch(items, method)
					.then((res) => {

						if(res.substring) throw new Error(res);

						this.updateStateFromApiPacketData(res.packet);
						resolve(res);
					})
					.catch((err) => reject(err.message || '_FETCHERROR'));
				}
				else reject('_FORMFIELDSERROR');
			});
		};

		// handling the outcome of the fetch operation should be handled in the invoking container
		// - if all seems good, then an object will be resolved for further processing down the line
		// 		- of course, there could still be an error (res.error > 0) which needs checking down the line
		// - otherwise a string errormessage will be returned - one of:
		// 		_FETCHERROR 			- fetch call failed in unknown way (probably frontend code)
		// 		_FORMFIELDSERROR 		- missing fields, or form input failed validation test
		// 		_FETCHAPIERROR 			- fetch call failed in unknown way (probably backend code)
		// 		_FETCHENDPOINTERROR 	- something is weong with the backend code, or this userContext code

		this.registerUser = (items = {}) => {

			return  this.callApi({
				endpoint: '/register',
				locale: items.locale,
				body: items
			}, 'POST', 'postRegister')
		};

		this.loginUser = (items = {}) => {

			return  this.callApi({
				endpoint: '/login',
				locale: this.state.locale,
				body: items
			}, 'PUT', 'putLogin')
		};

		this.logoutUser = (items) => {

			this.clearUser();
		};

		this.updateVisitorLocale = (items = {}) => {

			if(items.locale){
				this.setState({
					locale: items.locale,
				});
			}
		};

		this.loginRegisteredUser = () => {

			let s = this.state;

			if(this.checkUserLoggedIn(s.token, s.tokenExpires)){
				this.setState({
					isLoggedIn: true
				});
			}
		};

		this.updateUser = (items) => {};

		this.archiveUser = (items) => {};

		this.unarchiveUser = (items) => {};

		this.deleteUser = (items) => {};

		this.getUser = () => {
			return this.state;
		};

		this.clearUser = () => {
			this.setState({
				key: '',
				userName: '',
				name: '',
				twofaIsEnabled: false,
				isArchived: false,

				email: '',
				newEmail: '',

				isAdministrator: false,
				canArchiveOtherUsers: false,
				canDeleteOtherUsers: false,

				token: '',
				tokenExpires: '',

				isLoggedIn: false,

				userErrorMessage: '',
				userWarnMessage: '',
				userSuccessMessage: '',		// set to localized logged out success message
			});
		};

		this.updateUserMessages = (items = {}) => {

			let obj = {},
				flag = false,
				_state = this.state,
				e = items.error,
				w = items.warn ,
				s = items.success;

			if(e != null  && e !== _state.userErrorMessage){
				obj.userErrorMessage = e;
				flag = true;
			}
			if(w != null  && w !== _state.userWarnMessage){
				obj.userWarnMessage = w;
				flag = true;
			}
			if(s != null  && s !== _state.userSuccessMessage){
				obj.userSuccessMessage = s;
				flag = true;
			}

			if(flag){
				this.setState(obj);
			}
		};

		this.clearUserMessages = () => {
			this.setState({
				userErrorMessage: '',
				userWarnMessage: '',
				userSuccessMessage: ''
			});
		};

		this.checkUserLoggedIn = (token, expires) => {

			let flag = false;
			if(moment().isBefore(expires)){
				if(token.length){
					flag = true;
				}
			}
			return flag;
		};

		this.viewportResizeLastCheck = moment();
		this.viewportResizeChoke = 200;
		this.viewportMobileBreakpoint = 768;
		this.viewportResize = (force) => {
			if(force || moment().add(this.viewportResizeChoke, 'ms').isAfter(this.viewportResizeLastCheck)){
				this.viewportResizeLastCheck = moment();
				this.setState({ 
					isMobile: window.innerWidth < this.viewportMobileBreakpoint 
				});
			}
		};

/*
API will hold details on the following attributes, which get returned as packet data and stored in this state object:
	
	key
	userName
	name
	locale
	twofaIsEnabled
	isArchived

	email
	newEmail

	isAdministrator
	canArchiveOtherUsers
	canDeleteOtherUsers

	token
	tokenExpires

The state object additionally holds the following local attributes:

	isLoggedIn
	loginRegisteredUser
	isMobile

	userErrorMessage
	userWarnMessage
	userSuccessMessage

Functions are also included in the state object:

	getUser
	registerUser
	loginUser
	logoutUser
	updateUser
	archiveUser
	unarchiveUser
	deleteUser

	updateVisitorLocale

	clearUserMessages

The following attributes are kept in other component state objects and get passed to UserContext for dispatch to the API

	password
	recoveryPhrase

*/
		this.state = {
			key: '',
			userName: '',
			name: '',
			locale: 'en',
			twofaIsEnabled: false,
			isArchived: false,

			email: '',
			newEmail: '',

			isAdministrator: false,
			canArchiveOtherUsers: false,
			canDeleteOtherUsers: false,

			token: '',
			tokenExpires: '',

			isLoggedIn: false,
		    isMobile: false,

			userErrorMessage: '',
			userWarnMessage: '',
			userSuccessMessage: '',
			updateUserMessages: this.updateUserMessages,
			clearUserMessages: this.clearUserMessages,

			getUser: this.getUser,
		    registerUser: this.registerUser,
		    loginUser: this.loginUser,
		    logoutUser: this.logoutUser,
		    updateUser: this.updateUser,
		    archiveUser: this.archiveUser,
		    unarchiveUser: this.unarchiveUser,
		    deleteUser: this.deleteUser,

		    updateVisitorLocale: this.updateVisitorLocale,
		    loginRegisteredUser: this.loginRegisteredUser,
		};
	}

	componentDidMount() {
		this.viewportResize(true);
		window.addEventListener('resize', this.viewportResize);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.viewportResize);
	}

	render() {
		return (
			<UserContext.Provider value={this.state}>
				{this.props.children}
			</UserContext.Provider>
		);
	}
};

export {
	UserProvider,
	UserConsumer
};
