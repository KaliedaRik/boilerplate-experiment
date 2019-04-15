import React from 'react';
import ReactDOM from 'react-dom';

import { UserProvider } from '../components/UserContext';
import Home from '../components/Home';

it('renders without crashing', () => {
	const div = document.createElement('div');
	ReactDOM.render(<UserProvider><Home /></UserProvider>, div);
	ReactDOM.unmountComponentAtNode(div);
});
