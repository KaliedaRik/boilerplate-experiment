import React from 'react';
import ReactDOM from 'react-dom';

import { UserProvider } from '../components/UserContext';
import Privacy from '../components/Privacy';

it('renders without crashing', () => {
	const div = document.createElement('div');
	ReactDOM.render(<UserProvider><Privacy /></UserProvider>, div);
	ReactDOM.unmountComponentAtNode(div);
});
