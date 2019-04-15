import React, { Component } from 'react';
import { Form, Header, Divider } from 'semantic-ui-react';

import { addCopy } from './Copy';

import '../styles/LoginForm.css';

class LoginForm extends Component {

	constructor(props) {
		super(props);

		this.state = {
		    user: '',
		    password: ''
		};
	}

	update = () => {
		let p = this.props;

		p.updateUser({
	        token: 'mytoken',
	        tokenExpires: '2040-01-01'
		});
	}

	handleChange = (e, { name, value }) => {
		this.setState({ [name]: value })
	}

	render() {

		let copy = this.props.copy.LoginForm;
		let { user, password } = this.state;

		let cols = this.props.isMobile ? 16 : 8;

		let updatePath = (e) => this.props.push(e.target.dataset.url);

		return (
			<div className="LoginForm">

				<Header as='h2'>{copy.topHeader}</Header>

				<Form onSubmit={this.update}>

					<Form.Input 
						width={cols}
						label={copy.user} 
						placeholder={copy.user} 
						name='user' 
						value={user} 
						required
						onChange={this.handleChange} />

					<Form.Input 
						width={cols}
						label={copy.password} 
						placeholder={copy.password} 
						name='password' 
						value={password} 
						type='password' 
						required
						onChange={this.handleChange} />

					<Divider horizontal />

					<Form.Button color='blue' content={copy.action} />

				</Form>

				<div>
					<p><a data-url="/register" onClick={updatePath}>{copy.register}</a></p>
					<p><a data-url="/forgotten-password" onClick={updatePath}>{copy.forgottenPassword}</a></p>
				</div>

			</div>
		);
	}
}

export default addCopy(LoginForm);
