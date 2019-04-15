import React, { Component } from 'react';
import { Message } from 'semantic-ui-react';

import { UserConsumer } from './UserContext';
import { addCopy } from './Copy';

import '../styles/MessageBlock.css';

class MessageBlock extends Component {

	render() {

		let copy = this.props.copy.MessageBlock;

		return (
			<div className="MessageBlock">
				<UserConsumer>
					{( { userSuccessMessage, userWarnMessage, userErrorMessage, clearUserMessages } ) => (
						<div>
							{userSuccessMessage && <Message positive
								onDismiss={clearUserMessages}
								header={copy.successHeader}
								content={userSuccessMessage} />
							}

							{userWarnMessage && <Message warning
								onDismiss={clearUserMessages}
								header={copy.warnHeader}
								content={userWarnMessage} />
							}

							{userErrorMessage &&<Message negative
								onDismiss={clearUserMessages}
								header={copy.errorHeader}
								content={userErrorMessage} />
							}
						</div>
					)}
				</UserConsumer>
			</div>
		);
	}
}

export default addCopy(MessageBlock);
