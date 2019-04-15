import React, { Component } from 'react';

import { UserConsumer } from './UserContext';

import LoginForm from './LoginForm';

class LoginContainer extends Component {

	render() {

		return (
			<UserConsumer>
				{( { updateUser, isMobile } ) => (
					<LoginForm 
						push={this.props.history.push}
						isMobile={isMobile}
						updateUser={updateUser} />
				)}
			</UserConsumer>
		);
	}
}

export default LoginContainer;
