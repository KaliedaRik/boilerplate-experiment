const uuid = require('uuid/v4');

// get a fresh uuid value
const makeUuid = () => {
	return uuid();
};

module.exports = {
	makeUuid,
};
