import React, { Component } from 'react';
import { Header } from 'semantic-ui-react';

import { addCopy } from './Copy';

import '../styles/RegisterEmailMessage.css';

class RegisterEmailMessage extends Component {

	render() {

		let copy = this.props.copy.RegisterEmailMessage;

		return (
			<div className="RegisterEmailMessage">
				<Header as='h2'>{copy.topHeader}</Header>
				<p>{copy.body}</p>
			</div>
		);
	}
}

export default addCopy(RegisterEmailMessage);
