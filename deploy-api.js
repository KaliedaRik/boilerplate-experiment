// Require statements
const { credentials } = require('./aws-env.js');
const { buckets } = require('./deploy-env.js');
const { createZip, getS3Handle, pushFolderContentsToS3 } = require('./utilities.js');


// upload public folder contents to S3
var folderName = 'api', 
	bucketName = buckets.apiBucket,
	zipFolder = 'api-dist',
	ignoreFolder = ['node_modules', 'testdata'],
	ignoreFile = ['.DS_Store', 'database.test.js', 'databaseConnection.test.js', 'utilities.test.js', 'validateData.test.js', 'validations-testdata.js', 'yarn-error.log'];

createZip(zipFolder, folderName, null, ignoreFolder, ignoreFile)
.then((message) => {
	console.log(message);
	// in timeout because we do not want to send an incomoplete zip archive to S3
	setTimeout(() => {
		getS3Handle(credentials)
		.then((s3Handle) => {
			return pushFolderContentsToS3(s3Handle, bucketName, zipFolder, null, ignoreFolder, ignoreFile);
		})
		.then((message) => {
			console.log(message);
		})
		.catch((error) => {
			console.log(error);
		});
	}, 5000);
})
.catch((error) => {
	console.log(error);
});
