import React, { Component } from 'react';

import { UserConsumer } from './UserContext';

import ForgottenPasswordForm from './ForgottenPasswordForm';

class ForgottenPasswordContainer extends Component {

	render() {

		return (
			<UserConsumer>
				{( { isMobile } ) => (
					<ForgottenPasswordForm 
						isMobile={isMobile} />
				)}
			</UserConsumer>
		);
	}
}

export default ForgottenPasswordContainer;
