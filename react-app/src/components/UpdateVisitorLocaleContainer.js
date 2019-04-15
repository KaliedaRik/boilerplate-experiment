import React, { Component } from 'react';

import { UserConsumer } from './UserContext';

import UpdateVisitorLocaleForm from './UpdateVisitorLocaleForm';

class UpdateVisitorLocaleContainer extends Component {

	render() {

		return (
			<UserConsumer>
				{( { isMobile, updateVisitorLocale, locale } ) => (
					<UpdateVisitorLocaleForm 
						locale={locale} 
						updateVisitorLocale={updateVisitorLocale} 
						isMobile={isMobile} />
				)}
			</UserConsumer>
		);
	}
}

export default UpdateVisitorLocaleContainer;
