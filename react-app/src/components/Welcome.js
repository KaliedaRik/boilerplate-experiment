import React, { Component } from 'react';
import { Header } from 'semantic-ui-react';

import { addCopy } from './Copy';

import '../styles/Welcome.css';

class Welcome extends Component {

	render() {

		let copy = this.props.copy.Welcome;

		return (
			<div className="Welcome">
				<Header as='h2'>{copy.topHeader}</Header>
				<p>{copy.body}</p>
			</div>
		);
	}
}

export default addCopy(Welcome);
