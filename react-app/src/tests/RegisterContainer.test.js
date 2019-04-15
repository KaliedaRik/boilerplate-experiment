import React from 'react';
import ReactDOM from 'react-dom';

import { UserProvider } from '../components/UserContext';
import RegisterContainer from '../components/RegisterContainer';

it('renders without crashing', () => {
	const div = document.createElement('div');
	const history = {
		push: () => null
	};

	ReactDOM.render(<UserProvider><RegisterContainer history={history} /></UserProvider>, div);
	ReactDOM.unmountComponentAtNode(div);
});
