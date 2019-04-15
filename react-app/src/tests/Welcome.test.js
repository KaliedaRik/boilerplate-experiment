import React from 'react';
import ReactDOM from 'react-dom';

import { UserProvider } from '../components/UserContext';
import Welcome from '../components/Welcome';

it('renders without crashing', () => {
	const div = document.createElement('div');
	ReactDOM.render(<UserProvider><Welcome /></UserProvider>, div);
	ReactDOM.unmountComponentAtNode(div);
});
