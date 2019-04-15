import React, { Component } from 'react';

import { UserConsumer } from './UserContext';

import MessageBlock from './MessageBlock';
import RegisterForm from './RegisterForm';

class RegisterContainer extends Component {

	render() {

		return (
			<UserConsumer>
				{( { isMobile, registerUser, locale, updateUserMessages, loginRegisteredUser } ) => (
					<div>
						<MessageBlock 
							locale={locale} />
						<RegisterForm 
							push={this.props.history.push}
							locale={locale} 
							registerUser={registerUser} 
							loginRegisteredUser={loginRegisteredUser}
							updateUserMessages={updateUserMessages}
							isMobile={isMobile} />
					</div>
				)}
			</UserConsumer>
		);
	}
}

export default RegisterContainer;
