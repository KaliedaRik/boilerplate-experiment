import React from 'react';
import ReactDOM from 'react-dom';

import { UserProvider } from '../components/UserContext';
import PreferencesContainer from '../components/PreferencesContainer';

it('renders without crashing', () => {
	const div = document.createElement('div');
	ReactDOM.render(<UserProvider><PreferencesContainer /></UserProvider>, div);
	ReactDOM.unmountComponentAtNode(div);
});
