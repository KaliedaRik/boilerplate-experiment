import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { Menu } from 'semantic-ui-react';

import { UserConsumer } from './UserContext';
import { addCopy } from './Copy';
import LogoutAction from './LogoutAction';

import '../styles/TopNavigation.css';

class TopNavigation extends Component {

	constructor(props) {
		super(props);

		this.state = {
		    activeItem: '',
		};
	}

	handleItemClick = (e, { name }) => this.setState({ activeItem: name })

	render() {

		let { activeItem } = this.state

		let copy = this.props.copy.TopNavigation;

		return (
			<div className="TopNavigation">
				<UserConsumer>
					{( { logoutUser, isLoggedIn } ) => (
						<div>
							{isLoggedIn
								? <Menu inverted>
									<Menu.Item name='home' active={activeItem === 'home'} onClick={this.handleItemClick} as="span">
										<Link to="/">{copy.home}</Link>
									</Menu.Item>
									<Menu.Item name='preferences' active={activeItem === 'preferences'} onClick={this.handleItemClick} as="span">
										<Link to="/preferences">{copy.preferences}</Link>
									</Menu.Item>
									<Menu.Item name='unknown' active={activeItem === 'unknown'} onClick={this.handleItemClick} as="span">
										<Link to="/me">{copy.unknown}</Link>
									</Menu.Item>
									<Menu.Item name='logout' active={activeItem === 'logout'} onClick={this.handleItemClick}>
										<LogoutAction logoutUser={logoutUser} />
									</Menu.Item>
								</Menu> : <Menu inverted>
									<Menu.Item name='home' active={activeItem === 'home'} onClick={this.handleItemClick} as="span">
										<Link to="/">{copy.welcome}</Link>
									</Menu.Item>
									<Menu.Item name='unknown' active={activeItem === 'unknown'} onClick={this.handleItemClick} as="span">
										<Link to="/me">{copy.unknown}</Link>
									</Menu.Item>
									<Menu.Item name='login' active={activeItem === 'login'} onClick={this.handleItemClick} as="span">
										<Link to="/login">{copy.login}</Link>
									</Menu.Item>
									<Menu.Item name='reset' active={activeItem === 'reset'} onClick={this.handleItemClick} as="span">
										<Link to="/password-reset">{copy.passwordReset}</Link>
									</Menu.Item>
									<Menu.Item name='locale' active={activeItem === 'locale'} onClick={this.handleItemClick} as="span">
										<Link to="/update-visitor-locale">{copy.updateVisitorLocale}</Link>
									</Menu.Item>
								</Menu>}
						</div>
					)}
				</UserConsumer>
			</div>
		);
	}
}

export default addCopy(TopNavigation);
