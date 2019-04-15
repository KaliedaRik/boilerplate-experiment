import React, { Component } from 'react';
import { Form, Header, Divider } from 'semantic-ui-react';

import { addCopy } from './Copy';

import '../styles/ForgottenPasswordForm.css';

class ForgottenPasswordForm extends Component {

	constructor(props) {
		super(props);

		this.state = {
		    user: '',
		};
	}

	update = () => {
	}

	handleChange = (e, { name, value }) => {
		this.setState({ [name]: value })
	}

	render() {

		let copy = this.props.copy.ForgottenPasswordForm;

		let { user } = this.state;

		let cols = this.props.isMobile ? 16 : 8;

		return (
			<div className="ForgottenPasswordForm">

				<Header as='h2'>{copy.topHeader}</Header>

				<Form onSubmit={this.update}>

					<Form.Input 
						width={cols}
						label={copy.user} 
						placeholder={copy.user} 
						name='user' 
						value={user} 
						onChange={this.handleChange} />

					<Divider horizontal />

					<Form.Button color='blue' content={copy.action} />

				</Form>
			</div>
		);
	}
}

export default addCopy(ForgottenPasswordForm);
