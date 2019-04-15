import React, { Component } from 'react';

import { UserConsumer } from './UserContext';

import PasswordResetForm from './PasswordResetForm';

class PasswordResetContainer extends Component {

	render() {

		return (
			<UserConsumer>
				{( { isMobile } ) => (
					<PasswordResetForm 
						isMobile={isMobile} />
				)}
			</UserConsumer>
		);
	}
}

export default PasswordResetContainer;
