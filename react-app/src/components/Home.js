import React, { Component } from 'react';
import { Header } from 'semantic-ui-react';

import { UserConsumer } from './UserContext';
import { addCopy } from './Copy';

import '../styles/Home.css';

class Home extends Component {

	render() {

		let copy = this.props.copy.Home;

		return (
			<UserConsumer>
				{( { name } ) => (
					<div className="Home">
						<Header as='h2'>{copy.topHeader(name)}</Header>
						<p>{copy.body}</p>
					</div>
				)}
			</UserConsumer>
		);
	}
}

export default addCopy(Home);
