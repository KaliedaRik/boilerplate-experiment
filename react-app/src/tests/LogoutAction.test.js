import React from 'react';
import ReactDOM from 'react-dom';

import { UserProvider } from '../components/UserContext';
import LogoutAction from '../components/LogoutAction';

it('renders without crashing', () => {
	const div = document.createElement('div');
	ReactDOM.render(<UserProvider><LogoutAction /></UserProvider>, div);
	ReactDOM.unmountComponentAtNode(div);
});
