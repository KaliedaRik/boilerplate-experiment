import React, { Component } from 'react';
import { Form, Header, Divider } from 'semantic-ui-react';

import { addCopy } from './Copy';
import { testField } from '../validateData.js';
import { getSiteEnvironmentVariables } from '../utilities.js'

import '../styles/RegisterForm.css';

class RegisterForm extends Component {

	constructor(props) {
		super(props);

		this.state = {
		    name: '',
		    email: '',
		    password: '',
		    recoveryPhrase: '',
		    locale: '',
		};

		this.localeOptions = [];
	}

	componentDidMount(){
		let p = this.props,
			copyLocales = p.copy.RegisterForm.locales;

		let env = getSiteEnvironmentVariables(),
			locales = env.localeList,
			i, iz, loc;

		for(i = 0, iz = locales.length; i < iz; i++){

			loc = locales[i];

			this.localeOptions.push({
				key: loc, 
				text: copyLocales[loc], 
				value: loc
			});
		}

		this.setState({
			locale: p.locale || env.defaultLocale,
		});
	}

	// handling the outcome of the fetch operation should be handled in the invoking container
	// - if all seems good, then an object will be resolved for further processing down the line
	// 		- of course, there could still be an error (res.error > 0) which needs checking down the line
	// - otherwise a string errormessage will be returned - one of:
	// 		_FETCHERROR 			- fetch call failed in unknown way (probably frontend code)
	// 		_FORMFIELDSERROR 		- missing fields, or form input failed validation test
	// 		_FETCHAPIERROR 			- fetch call failed in unknown way (probably backend code)
	// 		_FETCHENDPOINTERROR 	- something is weong with the backend code, or this userContext code
	// ... and also:
	// 		_UPDATEERROR 			- something is wrong and we are clueless about it.

	update = () => {
		let s = this.state,
			p = this.props,
			copy = p.copy.RegisterForm;

		p.registerUser({
			name: s.name,
			email: s.email,
			password: s.password,
			recoveryPhrase: s.recoveryPhrase,
			locale: s.locale
		})
		.then((res) => {

			// status 			String - Fetch response status code
			// error 			Number - api response error code (0 for good returns; >0 for errors)
			// message 			String - api response error message
			// packet 			Object - containing data retrieved from api
			
			if(res.error){
				p.updateUserMessages({
					error: res.message
				});
			}
			else{
				// this is where we need to do checking of status codes etc - good registrations will return 200 or 201 
				// - dependant on whether an additional email confirmation needs to be performed 

				if(res.status === 201){

					// user registered without email address - need to redirect page view to home (or whatever)
					p.loginRegisteredUser();
					p.push('/');
				}
				else{

					// user registered with email address - need to show a message page informing user they can complete registration once they click on link supplied in confirmation email
					p.push('/register-confirm');
				}
			}
		})
		.catch((err) => {
			if(err.substring){

				if(err === '_FORMFIELDSERROR'){
					p.updateUserMessages({
						warn: copy._FORMFIELDSERROR
					});
				}
				else{
					p.updateUserMessages({
						error: copy[err]
					});
				}
			}
			else{
				p.updateUserMessages({
					warn: copy._UPDATEERROR
				});
			}
		});
	}

	handleChange = (e, { name, value }) => {
		this.setState({ [name]: value });
	}

	render() {

		let copy = this.props.copy.RegisterForm;

		let { name, email, password, recoveryPhrase, locale } = this.state;

		let cols = this.props.isMobile ? 16 : 8;

		let updatePath = (e) => this.props.push(e.target.dataset.url);

		return (
			<div className="RegisterForm">

				<Header as='h2'>{copy.topHeader}</Header>

				<Form onSubmit={this.update}>

					<Form.Input 
						width={cols}
						label={copy.name} 
						placeholder={copy.name} 
						name='name' 
						value={name} 
						required
						error={!testField('postRegister', 'name', name)}
						onChange={this.handleChange} />

					<Form.Input 
						width={cols}
						label={copy.email} 
						placeholder={copy.email} 
						name='email' 
						value={email} 
						onChange={this.handleChange} />

					<Form.Input 
						width={cols}
						label={copy.password} 
						placeholder={copy.password} 
						name='password' 
						value={password} 
						type='password' 
						required
						error={!testField('postRegister', 'password', password)}
						onChange={this.handleChange} />

					<Form.Input 
						width={cols}
						label={copy.recoveryPhrase} 
						placeholder={copy.recoveryPhrase} 
						name='recoveryPhrase' 
						value={recoveryPhrase} 
						onChange={this.handleChange} />

					<Form.Select 
						width={cols}
						label={copy.locale} 
						name='locale' 
						value={locale} 
						options={this.localeOptions} 
						onChange={this.handleChange} />

					<Divider horizontal />

					<Form.Button color='blue' content={copy.action} />

				</Form>

				<div>
					<p><a data-url="/login" onClick={updatePath}>{copy.login}</a></p>
				</div>
			</div>
		);
	}
}

export default addCopy(RegisterForm);
