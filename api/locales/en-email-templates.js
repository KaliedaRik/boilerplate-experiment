module.exports = {

	recoverPassword: {
		// view = {
		// 	name: user.name,
		// 	token: token
		// }
		subject: 'Your recovery request for YOUR APP NAME',
		text: `
Hi, {{name}}

You have requested a password reset for YOUR APP NAME. Please visit this link to create a new password:

https://YOUR.PRODUCTION.API.SERVER.URL/recover/{{token}}

If this email comes as a surprise to you, [take action or ignore, as appropriate].

Best wishes,
YOUR SUPPORT TEAM NAME
`,
		html: `
<p>Hi, {{name}}</p>

<p>You have requested a password reset for YOUR APP NAME. Please visit this link to create a new password:</p>

<p><a href="https://YOUR.PRODUCTION.API.SERVER.URL/recover/{{token}}">YOUR.PRODUCTION.API.SERVER.URL/recover/{{token}}</a></p>

<p>If this email comes as a surprise to you, [take action or ignore, as appropriate].</p>

<p>Best wishes,<br />
YOUR SUPPORT TEAM NAME</p>
`,
	},


	register: {
		// view = {
		// 	name: user.name,
		// 	user: user.userName,
		// 	token: registerToken
		// }
		subject: 'Hi from YOUR APP NAME',
		text: `
Hi, {{name}}

Thank you for registering with YOUR APP NAME. Your user name is: {{user}}.

To complete your registration please visit this link:

https://YOUR.PRODUCTION.API.SERVER.URL/register/{{token}}

If this email comes as a surprise to you, and you have no interest in registering for the YOUR APP NAME app, then please accept our apologies. Registrations that are not confirmed within REGISTRATION_TOKEN_LIFESPAN_HOURS are automatically wiped from our systems.

Best wishes,
YOUR SUPPORT TEAM NAME
`,
		html: `
<p>Hi, {{name}}</p>

<p>Thank you for registering with YOUR APP NAME. Your user name is: {{user}}.</p>

<p>To complete your registration please visit this link:</p>

<p><a href="https://YOUR.PRODUCTION.API.SERVER.URL/register/{{token}}">YOUR.PRODUCTION.API.SERVER.URL/register/{{token}}</a></p>

<p>If this email comes as a surprise to you, and you have no interest in registering for the YOUR APP NAME app, then please accept our apologies. Registrations that are not confirmed within REGISTRATION_TOKEN_LIFESPAN_HOURS are automatically wiped from our systems.</p>

<p>Best wishes,<br />
YOUR SUPPORT TEAM NAME</p>
`,
	},


	updateEmail: {
		// view = {
		// 	name: packet.name,
		// 	token: data.emailUpdateToken
		// }
		subject: 'Your update request for YOUR APP NAME',
		text: `
Hi, {{name}}

You have recently updated your email details for YOUR APP NAME. Please visit this link to confirm this change:

https://YOUR.PRODUCTION.API.SERVER.URL/email-update/{{token}}

Until you confirm the email change your old email address (if previously registered with us) will remain effective, for instance to log into YOUR APP NAME.

If this email comes as a surprise to you, [take action or ignore, as appropriate].

Best wishes,
YOUR SUPPORT TEAM NAME
`,
		html: `
<p>Hi, {{name}}</p>

<p>You have recently updated your email details for YOUR APP NAME. Please visit this link to confirm this change:</p>

<p><a href="https://YOUR.PRODUCTION.API.SERVER.URL/email-update/{{token}}">YOUR.PRODUCTION.API.SERVER.URL/email-update/{{token}}</a></p>

<p>Until you confirm the email change your old email address (if previously registered with us) will remain effective, for instance to log into YOUR APP NAME.</p>

<p>If this email comes as a surprise to you, [take action or ignore, as appropriate].</p>

<p>Best wishes,<br />
YOUR SUPPORT TEAM NAME</p>
`,
	},
};
