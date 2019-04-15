import React, { Component } from 'react';
import { Form, Header, Divider } from 'semantic-ui-react';

import { addCopy } from './Copy';

import '../styles/UpdateVisitorLocaleForm.css';

class UpdateVisitorLocaleForm extends Component {

	constructor(props) {
		super(props);

		this.state = {
		    locale: '',
		};
	}

	componentDidMount(){
		let p = this.props;

		this.setState({
			locale: p.locale
		});
	}

	update = () => {
		let s = this.state,
			p = this.props;

		p.updateVisitorLocale({
			locale: s.locale,
		});
	}

	handleChange = (e, { name, value }) => {
		this.setState({ [name]: value })
	}

	render() {

		let copy = this.props.copy.UpdateVisitorLocaleForm;

		let { locale } = this.state;

		let options = [
			{ key: 'en', text: copy.locales.en, value: 'en' },
			{ key: 'xp', text: copy.locales.xp, value: 'xp' }
		];

		let cols = this.props.isMobile ? 16 : 8;

		return (
			<div className="UpdateVisitorLocaleForm">

				<Header as='h2'>{copy.topHeader}</Header>

				<Form onSubmit={this.update}>

					<Form.Select 
						width={cols}
						label={copy.locale} 
						name='locale' 
						value={locale} 
						options={options} 
						onChange={this.handleChange} />

					<Divider horizontal />

					<Form.Button color='blue' content={copy.action} />

				</Form>
			</div>
		);
	}
}

export default addCopy(UpdateVisitorLocaleForm);
