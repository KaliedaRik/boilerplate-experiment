import React from 'react';
import ReactDOM from 'react-dom';

import { UserProvider } from '../components/UserContext';
import UpdateVisitorLocaleContainer from '../components/UpdateVisitorLocaleContainer';

it('renders without crashing', () => {
	const div = document.createElement('div');
	ReactDOM.render(<UserProvider><UpdateVisitorLocaleContainer /></UserProvider>, div);
	ReactDOM.unmountComponentAtNode(div);
});
