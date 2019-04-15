import React, { Component } from 'react';
import { Header } from 'semantic-ui-react';

import { UserConsumer } from './UserContext';
import { addCopy } from './Copy';

import '../styles/NotFound.css';

class NotFound extends Component {

	render() {

		let copy = this.props.copy.NotFound;

		return (
			<UserConsumer>
				{( { userName } ) => (
					<div className="NotFound">
						<Header as='h2'>{copy.topHeader(userName)}</Header>
					</div>
				)}
			</UserConsumer>
		);
	}
}

export default addCopy(NotFound);
