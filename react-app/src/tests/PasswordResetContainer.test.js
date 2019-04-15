import React from 'react';
import ReactDOM from 'react-dom';

import { UserProvider } from '../components/UserContext';
import PasswordResetContainer from '../components/PasswordResetContainer';

it('renders without crashing', () => {
	const div = document.createElement('div');
	ReactDOM.render(<UserProvider><PasswordResetContainer /></UserProvider>, div);
	ReactDOM.unmountComponentAtNode(div);
});
