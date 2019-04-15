import React, { Component } from 'react';
import { Header } from 'semantic-ui-react';

import { addCopy } from './Copy';

import '../styles/Privacy.css';

class Privacy extends Component {

	render() {

		let copy = this.props.copy.Privacy;

		return (
			<div className="Privacy">
				<Header as='h2'>{copy.topHeader}</Header>
			</div>
		);
	}
}

export default addCopy(Privacy);
