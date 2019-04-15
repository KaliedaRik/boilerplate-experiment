import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { Menu } from 'semantic-ui-react';

import { addCopy } from './Copy';

import '../styles/BaseNavigation.css';

class BaseNavigation extends Component {

	render() {

		let copy = this.props.copy.BaseNavigation;

		return (
			<div className="BaseNavigation">
				<Menu inverted>
					<Menu.Item as="span"><Link to="/privacy">{copy.privacy}</Link></Menu.Item>
				</Menu>
			</div>
		);
	}
}

export default addCopy(BaseNavigation);
