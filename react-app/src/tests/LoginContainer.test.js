import React from 'react';
import ReactDOM from 'react-dom';

import { UserProvider } from '../components/UserContext';
import LoginContainer from '../components/LoginContainer';

it('renders without crashing', () => {
	const div = document.createElement('div');
	const history = {
		push: () => null
	};

	ReactDOM.render(<UserProvider><LoginContainer history={history} /></UserProvider>, div);
	ReactDOM.unmountComponentAtNode(div);
});
