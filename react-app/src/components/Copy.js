import React, { Component } from 'react';
import { UserConsumer } from './UserContext';
import en from '../locales/en';

function addCopy(WrappedComponent) {

	return class extends Component {

		constructor(props) {
			super(props);

			this.state = {
				dictionary: en,
				locale: 'en'
			}
		}

		getCopy = (locale) => {

			import(`../locales/${locale}`)
			.then((res) => {
				if(res && res.default){
					this.setState({
						dictionary: res.default,
						locale: locale
					});
					return true;
				}
				else throw new Error('unknown dictionary requested');
			})
			.catch((err) => {
				this.setState({
					dictionary: en,
					locale: 'en'
				});
				return false;
			});
		};

		render() {
			return (
				<UserConsumer>
					{( {locale} ) => (

						<WrappedComponent 
							copy={this.state.dictionary} 
							nonce={locale !== this.state.locale ? this.getCopy(locale) : false} 
							{...this.props} />
					)}
				</UserConsumer>
			);
		}
	};
}

export {
	addCopy
}
