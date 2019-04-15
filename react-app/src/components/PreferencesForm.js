import React, { Component } from 'react';
import { Form, Header, Divider } from 'semantic-ui-react';

import { addCopy } from './Copy';

import '../styles/PreferencesForm.css';

class PreferencesForm extends Component {

	constructor(props) {
		super(props);

		this.state = {
		    name: '',
		    email: '',
		    recoveryPhrase: '',
		    password: '',
		    locale: '',
		};
	}

	componentDidMount(){
		let p = this.props;

		this.setState({
			name: p.name,
			email: p.email,
			recoveryPhrase: p.recoveryPhrase,
			locale: p.locale
		});
	}

	update = () => {
		let s = this.state,
			p = this.props;

		p.updateUser({
			name: s.name,
			email: s.email,
			recoveryPhrase: s.recoveryPhrase,
			locale: s.locale
		});
	}

	handleChange = (e, { name, value }) => {
		this.setState({ [name]: value })
	}

	render() {

		let copy = this.props.copy.PreferencesForm;

		let { name, email, recoveryPhrase, locale, password } = this.state;

		let options = [
			{ key: 'en', text: copy.locales.en, value: 'en' },
			{ key: 'xp', text: copy.locales.xp, value: 'xp' }
		];

		let cols = this.props.isMobile ? 16 : 8;

		return (
			<div className="PreferencesForm">

				<Header as='h2'>{copy.topHeader}</Header>

				<Form onSubmit={this.update}>

					<Form.Input 
						width={cols}
						label={copy.name} 
						placeholder={copy.name} 
						name='name' 
						value={name} 
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
						label={copy.recoveryPhrase} 
						placeholder={copy.recoveryPhrase} 
						name='recoveryPhrase' 
						value={recoveryPhrase} 
						onChange={this.handleChange} />

					<Form.Input 
						width={cols}
						label={copy.password} 
						placeholder={copy.password} 
						name='password' 
						value={password} 
						type='password' 
						onChange={this.handleChange} />

					<Form.Select 
						width={cols}
						label={copy.locale} 
						name='locale' 
						value={locale} 
						options={options} 
						onChange={this.handleChange} />

					<Divider horizontal />

					<Form.Button color='blue' content={copy.action} />

				</Form>
			</div>
		);
	}
}

export default addCopy(PreferencesForm);
