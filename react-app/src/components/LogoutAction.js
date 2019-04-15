import React, { Component } from 'react';
import { Button } from 'semantic-ui-react';

import { addCopy } from './Copy';

class LogoutAction extends Component {

	render() {

		let copy = this.props.copy.LogoutAction;

		let update = (e) => {
			this.props.logoutUser();
		};

		return (
			<Button color='blue' onClick={update}>
				{copy.button}
			</Button>
		);
	}
}

export default addCopy(LogoutAction);
