// Require statements
const { credentials } = require('./aws-env.js');
const { buckets } = require('./deploy-env.js');
const { getS3Handle, pushFolderContentsToS3 } = require('./utilities.js');


// upload public folder contents to S3
var folderName = 'contracts', 
	bucketName = buckets.contractBucket,
	ignoreFolder = ['node_modules'],
	ignoreFile = ['.DS_Store'];

getS3Handle(credentials)
.then((s3Handle) => {
	return pushFolderContentsToS3(s3Handle, bucketName, folderName, null, ignoreFolder, ignoreFile);
})
.then((message) => {
	console.log(message);
})
.catch((error) => {
	console.log(error);
});
