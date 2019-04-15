import React, { Component } from 'react';
import { Form, Header, Divider } from 'semantic-ui-react';

import { addCopy } from './Copy';

import '../styles/PasswordResetForm.css';

class PasswordResetForm extends Component {

	constructor(props) {
		super(props);

		this.state = {
			// url token
		    password: '',
		};
	}

	componentDidMount(){
		// need to get the url token
	}

	update = () => {}

	handleChange = (e, { name, value }) => {
		this.setState({ [name]: value })
	}

	render() {

		let copy = this.props.copy.PasswordResetForm;

		let { password } = this.state;

		let cols = this.props.isMobile ? 16 : 8;

		return (
			<div className="PasswordResetForm">

				<Header as='h2'>{copy.topHeader}</Header>

				<Form onSubmit={this.update}>

					<Form.Input 
						width={cols}
						label={copy.password} 
						placeholder={copy.password} 
						name='password' 
						value={password} 
						required
						onChange={this.handleChange} />

					<Divider horizontal />

					<Form.Button color='blue' content={copy.action} />

				</Form>
			</div>
		);
	}
}

export default addCopy(PasswordResetForm);
