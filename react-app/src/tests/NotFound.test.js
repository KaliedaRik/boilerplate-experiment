import React from 'react';
import ReactDOM from 'react-dom';

import { UserProvider } from '../components/UserContext';
import NotFound from '../components/NotFound';

it('renders without crashing', () => {
	const div = document.createElement('div');
	ReactDOM.render(<UserProvider><NotFound /></UserProvider>, div);
	ReactDOM.unmountComponentAtNode(div);
});
