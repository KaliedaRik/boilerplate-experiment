// NOTE - THESE TESTS WILL FAIL IF THE ARANGOdb SERVER IS NOT RUNNING

process.env.MYENVIRONMENT = 'dev';

const moment = require('moment');

// v1-archive-actions.js exports
// module.exports = {
// 	actionDeleteUser: actionDeleteUser,
// 	actionGetArchive: actionGetArchive,
// 	actionPostArchive: actionPostArchive,
// 	actionPutArchive: actionPutArchive,
// };

// TEST NOT YET WRITTEN
// test('v1UArchive-01 will register, archive, unarchive and delete new test user', () => {
// 	// test goes here
// });


// TEST NOT YET WRITTEN
// test('v1UArchive-02 will register, archive, unarchive and delete new test user with 2FA enabled', () => {
// 	// test goes here
// });


test('v1ArchActions-01', () => {
	expect(true).toBeTruthy();
});
