import React, { Component } from 'react';

import { UserConsumer } from './UserContext';

import PreferencesForm from './PreferencesForm';

class PreferencesContainer extends Component {

	render() {

		return (
			<UserConsumer>
				{( { getUser, updateUser, isMobile, userName, email, recoveryPhrase, locale } ) => (
					<PreferencesForm 
						getUser={getUser} 
						updateUser={updateUser} 
						isMobile={isMobile}
						userName={userName}
						email={email}
						recoveryPhrase={recoveryPhrase}
						locale={locale} />
				)}
			</UserConsumer>
		);
	}
}

export default PreferencesContainer;
