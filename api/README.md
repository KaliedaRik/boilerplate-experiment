# RikWorks Boilerplate Code - backend

The boilerplate backend has been configured for user management (onboarding, login, archive and delete) but no further. Each API built from the backend will need to extend this core so it can serve content from the database to the frontend.

The __data contract__ - which details backend endpoints for the API - has been written up in [https://github.com/OAI/OpenAPI-Specification](OpenAPI). Best practice is to update the contract before building new API endpoints in the backend, alongside the code required to handle that endpoint's data in the database.

## Components and services

The backend has been designed to be (largely) modular, so that key components and services can be easily replaced by equivalent components and services. 
### Server and Router

The boilerplate code uses [http://restify.com/](Restify) as both the API's server and router manager.

The server code can be found in __index.js__ - the code handles all calls to the API, performing data payload checks as well as server security such as request throttling and headers verification. The contents of data payloads received and returned are set out in the data contract. Language localization is also initialized in the index file. 

Route code is handled in a pair of files - __v1-WHATEVER-router.js__ and __v1-WHATEVER-actions.js__. Two route families are included in the boilerplate code:

* User-related actions, handled in the __v1-user-router.js__ and __v1-user-actions.js__ files
* Archive-related actions, handled in the __v1-archive-router.js__ and __v1-archive-actions.js__ files

(The plan is that if/when the API develops new endpoint functionality we can add in v2- files to handle that functionality, while at the same time maintaining the old functionality in the existing v1- files.)

The __-router.js__ files handle caller validation before handing calls on to the related __-actions.js__ file. Once action on a request completes, the -router.js code is responsible for finalizing and sending the response payload. Common functions used across various route end points can be found in the __v1-router-utilities.js__ file.

The __-actions.js__ files handle the functionality required for each API call:

* instigate add, update and deletion of data in the database, as appropriate
* requesting data from the database and preparing the response data payload
* preparing tokens, as required
* dispatching emails, as required

#### Response codes

I've developed a set of system response codes to help me troubleshoot issues. I've also localized response messages as part of my localization learning journey (see files in the __locales__ folder). Current response codes are:

* 101:OK_BASIC
* 102:OK_AUTHORIZED
* 103:EMAIL_SENT
* 104:OK_REGISTER
* 105:OK_RECOVER
* 106:OK_USER_UPDATED
* 107:OK_DELETED_EMAIL_WARNING
* 108:OK_UPDATED_EMAIL_WARNING
* 109:OK_EMAIL_UPDATED
* 110:OK_2FA_DATA
* 111:OK_2FA_LOGIN
* 112:OK_TOKEN_REFRESHED
* 113:OK_PASSWORD
* 114:OK_OTHER_USER_UPDATED

* 601:OK_USER_ARCHIVED
* 602:OK_USER_UNARCHIVED
* 603:OK_USER_DELETED
* 604:OK_ARCHIVE

* 1001:ERROR_DATA
* 1002:ERROR_DATA_VALIDATION
* 1003:ERROR_LOGIN
* 1004:ERROR_TOKEN
* 1005:ERROR_AUTHORIZATION
* 1006:ERROR_EMAIL_BAD
* 1007:ERROR_DUPLICATE_USER
* 1008:ERROR_DUPLICATE_LOGIN
* 1009:ERROR_USER_INACTIVE
* 1010:ERROR_TOKEN_STALE
* 1011:ERROR_ARCHIVE_MISMATCH
* 1012:ERROR_DUPLICATE_ARCHIVE
* 1013:ERROR_LOGIN_ARCHIVED
* 1014:ERROR_LOGIN_UNARCHIVED
* 1015:ERROR_DELETE_MISMATCH
* 1016:ERROR_TWOFA_INCOMPLETE
* 1017:ERROR_TWOFA_CLOSED
* 1018:ERROR_PERMISSIONS_FAIL
* 1019:ERROR_ARCHIVE

* 2001:ERROR_EMAIL_NOT_SENT

* 3001:DB_ERROR_INSERTION
* 3002:DB_ERROR_UPDATE
* 3003:DB_ERROR_DELETE
* 3004:DB_ERROR_USER
* 3005:DB_ERROR_KEY

* 4001:ERROR_PASSWORD
* 4002:ERROR_PASSWORD_MISMATCH
* 4003:ERROR_TOKEN_GENERATION
* 4004:ERROR_TOKEN_DECRYPTION

* 9001:SYSTEM_ERROR

### Data validation

Rather than rely on 3rd party data validation code, and as a learning experience, I developed my own data validation code. A key aim for this exercise is to have (almost) the same validation code running in both the backend and the frontend.

Validation code lives in the __validateData.js__ file

The boilerplate code validates data received in requests, in line with the requirements set out in the __data contract__. 

The tests to be performed on data received at each end point are defined in the __validations.js__ file.

### Database functionality

Database functionalities are orchestrated in the __v1-database.js__ file. The database functions themselves are coded in the appropriate plugin files - v1-database.js expects to find two plugin files: plugin-DATABASE-user.js, and plugin-DATABASE-archive.js, with the value of DATABASE set in  the server z- files.

At the moment the boilerplate includes code only for the [https://www.arangodb.com/](ArangoDB) database (because: exciting new learning experience!). My plan is to add other database code (as the need arrises and time permits), for example [https://mariadb.org/](MySQL/MariaDB), and [https://www.sqlite.org/index.html](SQLite). To keep the boilerplate core code manageable I will probably move the ArangoDB code into its own GitHub repository at some point in the future - once I've worked out a more general extensions system.

#### ArangoDB plugin

Connection credentials are kept in z- env files specific for ArangoDB - see __z-STACK-arangodb-env.TEMPLATE.js__ 

Clone the template file to create files for each specific environment: __z-dev-arangodb-env.js__ and __z-prod-arangodb-env.js__

The codebase also includes a __z-process-arangodb.js__ file - to use this file, the __getDatabaseEnvironmentVariables()__ function in __plugin-arangodb-connection.js__ will need to be updated manually.

The arangodb plugin comprises 3 files:

* __plugin-arangodb-user.js__ - to work with user routes
* __plugin-arangodb-archive.js__ - to work with archive routes
* __plugin-arangodb-connection.js__ - to manage persistent connections to the database, alongside a bespoke connections pool

When adding new end points to the router, additional arangodb plugin files will also need to be developed (see below)

### Extending the API service

The plan is that when I instantiate the boilerplate to create a real api/website I will create additional files to handle data specific to that website. Boilerplate code handles the following:

* User-related actions - v1-user-router.js, v1-user-actions.js, plugin-DATABASE-user.js
* Archive-related actions - v1-archive-router.js, v1-archive-actions.js, plugin-DATABASE-archive.js

... so if I wanted to add blogging functionality to my new site I could add code in the following new files:

* Blog-related actions - v1-blog-router.js, v1-blog-actions.js, plugin-DATABASE-blog.js

... which would (in theory) allow third parties to code up (reusable) function modules which could be added to the boilerplate core only where needed. 

The big issue with this plan are:

* v1-database.js - adding a blog module would require changes to this file to make sure the new files were required, and their functions made available to the wider system
* index.js - new routes need to be added to this file manually

### Non-database functionality

Again, I've tried to componentize non-database functionalities so that I can chop-and-change stuff on a per-api/website basis. The current components include:

* checking email validity
* password management
* single use token management
* two factor authentication 
* web token management

The choice of components and services to be used in a boilerplate backend instance should be set in the files cloned from __z-STACK-server-env.TEMPLATE.js__ - the code assumes that two files will be cloned from the template (_z-dev-server-env.js, z-prod-server-env.js_), though the values assigned to attributes in each file should be the same (for the sake of sanity)

The values assigned to attributes in the server-env files relate to the appropriate plugin-COMPONENT.js files.

It is also possible to use __system variables__ - see __z-process-server.js__ file for the variable names. 

If system variables are used then appropriate changes need to be made to the __getServerEnvironmentVariables()__ function in the __utilities.js__ file to make sure the correct environments file is required.

The purpose of the __utilities.js__ file is to make sure the boilerplate code uses the correct plugin code.

I plan to add alternatives to these plugins in due course, on an as-and-when-required basis. Separating out plugins into their own github repositories is also something I need to consider in due course.

#### Email address validity plugins

* __plugin-email-verify.js__ for checking email address validity using [https://github.com/EmailVerify/email-verify](email-verify)

Email address validation plugins should not rely on regular expression strings; rather they should ping the email address server to find out whether the email exists.

Plugins need to export the following function:

verifyEmail(email)
- in: _email_ - email address string
- out: Boolean - true if email exists; false otherwise

#### Password management plugins

* __plugin-argon.js__ for password management using [https://github.com/P-H-C/phc-winner-argon2](Argon 2)

Password management plugins should use a hash string to encrypt password strings. The raw password should never be stored in the database, only the hashed value of the string.

Plugins need to export the following functions:

checkPassword(pwd, hash)
- in: _pwd_ - password string
- in: _hash_ - hash salt value
- out: Boolean - true if password matches the stored password; false otherwise

encryptPassword(pwd)
- in: _pwd_ - password string
- out: String - hashed password, for storing in database

#### Single-use token management plugins

* __plugin-uuid.js__ for single use token management using [https://github.com/kelektiv/node-uuid](node-uuid)

Single-use token plugins need to generate v4 format uuid strings.

Plugins need to export the following function:

makeUuid()
- out: a properly formatted v4 UUID string 

#### Two-factor authentication management plugins

* __plugin-speakeasy.js__ for two-factor authentication using [https://github.com/speakeasyjs/speakeasy](Speakeasy)

2FA plugins need to both generate a String code which users can use to add the site to their one-time password manager (eg: Authy, OTPManager, etc), and also a QRcode image string.

Plugins need to export the following functions:

generateTwofaToken(secret)
- in: _secret_ - a uuid value, generated by the core code on a per-user basis
- out: if all goes well, a 6 digit number in String format; Boolean false otherwise

makeTwofaCodes()
- out: if all goes well, an Object containing attributes of __secret__ String, and __image__ String - both of which can be supplied to the user; Boolean false otherwise

verifyTwofaToken(secret, token)
- in: _secret_ string, as suppled by the core code from the secret stored in the database
- in: _token_ string - a 6 digit number in String format
- out: Object returning the secret and token, if verified; Boolean false otherwise

#### Web token management plugins

* __plugin-jwt.js__ for web token management using [https://github.com/auth0/node-jsonwebtoken](jsonwebtoken)

Currently I'm sticking to a system which relies on the web token using lots of garbage and/or randomly generated data, with a minimal amount of user-specific data embedded in it (user name, email, etc). Web tokens need to be time limited. The core system will generate a secret unique to each user and store that secret in a space separate from the generated tokens (and other user data) themselves.

Plugins need to export the following functions:

makeToken(data, secret, expiresLimit)
- in: _data_ - an object of user-specific data, supplied by the core code
- in: _secret_ - a uuid value, generated by the core code on a per-user basis
- in: _expiresLimit_ - a number value representing the hours from the moment of generation during which the token will remain valid
- out: Object - containing attributes for the signed __token__ (String), __secret__ (String), and __expires__ (unix value rendered as an ISOString date)

verifyToken(token, secret)
- in: _token_ - string supplied in the request
- in: _secret_ - string stored in the database for the (alleged) user
- out: if token is valid, an Object containing attributes of __data__ (Object of data stored in the token), __expires__ (Date in ISOString format) and the __token__ string supplied in the request; Boolean false otherwise

### Email service

The boilerplate code doesn't include any email functionality beyond generating and sending emails in plain-text and html formats. Also, there is a tight coupling between core functionality and localization functionality which the email management code needs to take into account.

I have separated out code to manage using 3rd party email services.

#### Mailgun plugin

During development I have used the following email service:

* __Mailgun__ - [https://www.mailgun.com/](main site), and [https://github.com/mailgun/mailgun-js](GitHub site for javascript library)

The mailgun plugin is made up of the following files:

* __plugin-mailgun.js__ for connecting to the 3rd party email service and dispatching emails
* __z-STACK-mailgun-env.TEMPLATE.js__ from which filles can be cloned to hold connection details (z-dev-mailgun-env.js, z-prod-mailgun-env.js)
* __z-process-mailgun.js__

Email templates (which are independent of the email service) are kept in the locales folder. Each locale gets its own file. The boilerplate code currently includes two email templates files:

* __locales/en-email-templates.js__ - English (UK)
* __locales/xp-email-templates.js__ - English (Pirate) - purely to test localization functionality

The templates get rendered into email copy using Mustache - https://mustache.github.io/

#### Developing other email service plugins

The plugin-EMALSERVICE.js file needs to export the following function:

__postSystemEmail(template, view, recipients, locale)__ - to send emails

* __template__ String - the locales email template key (for example 'recoverPassword')
* __view__ Object - Object containing key-value pairs of the data to be rendered into the template using Mustache
* __recipients__ - Array of email address strings (preferably verified as existing)
* __locale__ - String - locale code (currently accepts 'en' [default] or 'xp' - as set up in __copy.js__ file)

### Localization

Localization isn't strictly necessary on the backend, but I thought it would be fun to do.

Requests sent to the router can include locale values either in the header ('Accept-Language'), or in the request body ('locale' key). The boilerplate code currently supports __'en'__ (English (UK) - set as the default) and __'xp'__ (English (Pirate) - purely for testing purposes)

Localization functionality is coded up in the __copy.js__ file. When adding a new locale this file should be updated manually to include it.

Supported locales are also recorded in the z- server environment files - see __z-STACK-server-env.TEMPLATE.js__. Again, these files need to be updated when a new locale is added to the system.

Locale-specific copy gets stored in files in the __locales__ folder. The boilerplace code currently includes the following files ...

For system-generated response messages:

* en-copy.js
* xp-copy.js

For system-generated emails:

* en-email-templates.js
* xp-email-templates.js

## Local development

0. Make sure you have Node/NPM, Yarn, etc installed on your local machine
1. Fork/clone/whatever the GitHub repository to your local machine. 
2. Rename the folder. Create a new git/whatever for the website/api you will be building (unless contributing to the Boilerplate code itself)
3. cd into the Boilerplate root folder. Run npm install.
4. cd into the /api folder. Run npm install.
5. cd into the selected frontend folder (currently only _react-app_ frontend is available). Run npm install.
6. Make copies of the required -env.js files (generally the ones with -TEMPLATE in their name) and add values suitable for your local dev environment to the various object attributes.
7. Setup the selected database (currently only _ArangoDB_ database is available)
8. Start the database
9. From the Boilerplate root folder, run:

    $> yarn test-contract
    $> yarn start-api-dev
    $> yarn start-react-app

10. Should now be able to do the following stuff:

    View the data contract at [http://localhost:8008](http://localhost:8008)
    View the React frontend at [http://localhost:3000](http://localhost:3000) - may open automatically because Create React App
    Interrogate the backend api (using curl, Postman, etc) at whatever port you gave it in the z-dev-env.js file, for example [http://localhost:8080](http://localhost:8080) 

### Testing

Tests are written in Jest - [https://jestjs.io/](https://jestjs.io/) - the current tesats are probably too complex and could do with being winnowed down to the essentials. Rather than unit tests for each function, I've gone to the other extreme of coding up user journeys for each key backend file:

* utilities.test.js
* v1-archive-actions.test.js
* v1-archive-router.test.js
* v1-database.test.js
* v1-user-actions.test.js
* v1-user-router.test.js
* validateData.test.js

I've not written any tests specifically for the plugin files - plugin functionality is tested via the key files, which make use of the exported plugin functions.

Note that some tests involve dispatching emails (chose not to spoof that functionality as it's fundamental to the user onboarding process). Generally these tests are commented out in the test files. To include the email tests, uncomment the tests in the key files (above) and update the email addresses to be used for the tests in the appropriate Z- server files

Currently no test for the index.js server and routes. I plan on writing a jmeter - https://jmeter.apache.org/ - load testing file which will be capable of testing api end points when the api server is running - either locally, or via a tool like Blazemeter.

The api test suite can be run from the root folder (using yarn), or from the /api folder. While the api server does not need to be running while the tests are run, the database server _does_ need to be running and capable of receiving requests.

    $> jest --coverage --no-cache --runInBand

    $> yarn test-api

## Deployment to production

I've written my own bespoke code to generate a zip file of the api code and dump that file into an AWS S3 bucket. The plan is that, once the zip file has been transferred to S3, I can then use some AWS magic (such as [https://docs.aws.amazon.com/codedeploy/latest/userguide/welcome.html](CodeDeploy) - or even something simpler) to build/update the production API.

Deployment happens from the boilerplate root folder. Environment variables for the deployment (AWS credentials, S3 bucket names, etc) are set in the root folder files __aws-env.js__ and __deploy-env.js__ which need to be created from their respective TEMPLATE files.

    $> yarn deploy-api

## Routmap

These are the things I need to tackle, and would like to do, with the Boilerplate code

### Immediate - get the system working locally

1. Work out the basic rules for an archive policy
2. Finish coding up the archive-related routes
3. Finish writing the tests for the archive-related routes
4. Update the data contract (if necessary)
5. Finish developing the frontend - specifically linking it up to the backend api
6. Test, test, test - via frontend!
7. Write the Jmeter tests for more load testing
8. Bugfix as required
9. Finish initial documentation work (keeping it rough and ready)
10. Release on github as an alpha repository

### Near future - functionality plugins

1. Develop a bespoke personal site from the Boilerplate code
2. Add basic todo list functionality - as if supplied by a 3rd party developer
3. Add basic blogging functionality - as if supplied by a 3rd party developer
4. From these exercises, correct any backend bugs uncovered
5. Work out possible ways to update instance systems with latest version boilerplate core code
6. Further develop the backend to make integrating 3rd party developer functionality plugins as painless as possible

### Mid-future

1. Review security functionality - a lot may have changed since 2018
2. Develop alternative database plugins - eg MariaDB, SQLite
3. Implement the boilerplate code as the bedrock for redeveloping a few of my personal websites
4. Update boilerplate code with bugfixes etc
5. Release on GitHub as a beta repository

### Long-term future

1. Sit back and bask in the glory
2. Bugfix and security update boilerplate code as required
