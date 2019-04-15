import React, { Component } from 'react';

import {
  BrowserRouter as Router,
  Route, Redirect, Switch,
} from 'react-router-dom';

import { UserProvider, UserConsumer } from './UserContext';

import BaseNavigation from './BaseNavigation';
import ForgottenPasswordContainer from './ForgottenPasswordContainer';
import Home from './Home';
import LoginContainer from './LoginContainer';
import NotFound from './NotFound';
import PasswordResetContainer from './PasswordResetContainer';
import PreferencesContainer from './PreferencesContainer';
import Privacy from './Privacy';
import RegisterContainer from './RegisterContainer';
import RegisterEmailMessage from './RegisterEmailMessage';
import TopNavigation from './TopNavigation';
import UpdateVisitorLocaleContainer from './UpdateVisitorLocaleContainer';
import Welcome from './Welcome';

class App extends Component {

	render() {
		return (
			<UserProvider>
				<div className="App">
					<UserConsumer>
						{( { isLoggedIn } ) => (
							<Router>
								<div>
									<TopNavigation />

									{isLoggedIn 
										? <div>
											<Switch>
												<Route exact path="/" component={Home} />
												<Redirect from="/forgotten-password" to="/" />
												<Redirect from="/login" to="/" />
												<Redirect from="/password-reset" to="/" />
												<Route path="/preferences" component={PreferencesContainer} />
												<Route path="/privacy" component={Privacy} />
												<Redirect from="/register" to="/" />
												<Redirect from="/register-confirm" to="/" />
												<Redirect from="/update-visitor-locale" to="/" />
												<Route component={NotFound} />
											</Switch>
										</div> : <div>
											<Switch>
												<Route exact path="/" component={Welcome} />
												<Route path="/forgotten-password" component={ForgottenPasswordContainer} />
												<Route path="/login" component={LoginContainer} />
												<Route path="/password-reset" component={PasswordResetContainer} />
												<Redirect from="/preferences" to="/" />
												<Route path="/privacy" component={Privacy} />
												<Route path="/register" component={RegisterContainer} />
												<Route path="/register-confirm" component={RegisterEmailMessage} />
												<Route path="/update-visitor-locale" component={UpdateVisitorLocaleContainer} />
												<Route component={NotFound} />
											</Switch>
										</div>
									}

									<BaseNavigation />
								</div>
							</Router>
						)}
					</UserConsumer>
				</div>
			</UserProvider>
		);
	}
}

export default App;
