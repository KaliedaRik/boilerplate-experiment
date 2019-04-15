// Require statements
const S3 = require('aws-sdk/clients/s3');
const archiver = require('archiver');
const fs = require('fs');

// Promises
const getS3Handle = (credentials) => {
	return new Promise((resolve, reject) => {
		let h = new S3({
			apiVersion: '2006-03-01',
			region: 'eu-west-1',
			credentials: credentials
		});

		if(h && h.config && h.config.credentials){
			resolve(h);
		}
		else{
			reject(new Error('S3 handle lacks credentials'));
		}
	});
};

const readFile = (file) => {
	return new Promise((resolve, reject) => {

		fs.readFile(file, (err, data) => {
			if (err) {
				reject(err);
			};
			resolve(data);
		});
	});
};

const pushFileToS3 = (handle, bucket, key, file) => {
	return new Promise((resolve, reject) => {

		let params = {
			Body: file, 
			Bucket: bucket, 
			ContentType: getMimetype(key),
			Key: key
		};

		console.log(`Pushing ${key} to S3`);

		handle.putObject(params, (err, data) => {
			if (err) {
				reject(err);
			}
			resolve('file uploaded');
		});
	});
};

const checkForFile = (handle, bucket, folder, path, filename, ignoreFolder, ignoreFile) => {
	return new Promise((resolve, reject) => {

		fs.stat(`./${folder}/${filename}`, (err, res) => {
			if(err){
				reject(err);
			}
			if(res.isFile()){
				if(ignoreFile.indexOf(filename) < 0){
					readFile(`./${folder}/${filename}`)
					.then((file) => {
						return pushFileToS3(handle, bucket, `${path}${filename}`, file);
					})
					.then((message) => {
						resolve();
					})
					.catch((err) => {
						console.log(err);
						reject(err);
					});
				}
			}
			else{
				if(ignoreFolder.indexOf(filename) < 0){
					pushFolderContentsToS3(handle, bucket, `${folder}/${filename}`, `${path}${filename}/`, ignoreFolder, ignoreFile)
					.then(() => {
						resolve();
					})
					.catch((err) => {
						reject(err);
					});
				}
			}
		});
	});
};

const pushFolderContentsToS3 = (handle, bucket, folder, path, ignoreFolder, ignoreFile) => {
	return new Promise((resolve, reject) => {

		let items, i, iz;

		path = path || '';

		fs.readdir(`./${folder}`, (err, res) => {
			items = res;
			for(i = 0, iz = items.length; i < iz; i++){
				checkForFile(handle, bucket, folder, path, items[i], ignoreFolder, ignoreFile)
				.catch((err) => {
					console.log(err);
				})
			}
			resolve('reading directory');
		});
	});
};

const addFileToZip = (destination, folder, path, filename, ignoreFolder, ignoreFile, zip) => {
	return new Promise((resolve, reject) => {

		let source = `${folder}/${filename}`;
		let sink = source.split('/');
		source = `./${source}`;
		sink.shift();
		sink = sink.join('/');

		fs.stat(source, (err, res) => {
			if(err){
				reject(err);
			}
			if(res.isFile()){
				if(ignoreFile.indexOf(filename) < 0){
					console.log(`attempting to archive ${source} as ${sink}`);
					zip.file(source, { name: sink });
				}
				resolve();
			}
			else{
				if(ignoreFolder.indexOf(filename) < 0){
					console.log(`recursing to folder ${source}`);
					createZip(destination, `${folder}/${filename}`, `${path}${filename}/`, ignoreFolder, ignoreFile, zip)
					.then(() => {
						resolve();
					})
					.catch((err) => {
						reject(err);
					});
				}
				else{
					resolve();
				}
			}
		});
	});
};

const createZip = (destination, folder, path, ignoreFolder, ignoreFile, zip) => {
	return new Promise((resolve, reject) => {

		let items, i, iz, output,
			promises = [];

		path = path || '';

		if(!zip && destination){
			fs.unlink(`${destination}/build.zip`, (error) => {
			    if (error) {
			        console.log(error);
			    }
			    console.log(`deleted ${destination}/build.zip`);
			});
			output = fs.createWriteStream(`${destination}/build.zip`);
			zip = archiver('zip', {
				zlib: { level: 9 }
			});
			output.on('close', () => {
				console.log(zip.pointer() + ' total bytes');
				console.log('zip has been finalized and the output file descriptor has closed.');
			});
			output.on('end', () => {
				console.log('Data has been drained');
			});
			zip.on('warning', (err) => {
				if (err.code !== 'ENOENT') {
					throw err;
				}
			});
			zip.on('error', (err) => {
				throw err;
			});
			zip.pipe(output);
		}

		console.log(`processing ./${folder} ...`);

		fs.readdir(`./${folder}`, (err, res) => {
			items = res;
			for(i = 0, iz = items.length; i < iz; i++){
				promises.push(addFileToZip(false, folder, path, items[i], ignoreFolder, ignoreFile, zip));
			}
			Promise.all(promises)
			.then((results) => {
				if(destination){
					console.log('finalizing zip file');
					zip.finalize();
				}
				resolve(`./${folder} processing completed`);
			})
			.catch((error) => {
				console.log(error);
				resolve(`./${folder} processing completed - with errors`);
			})
		});
	});
};

// Mimetype - guess from the file .tld (default to 'text/plain')
const mimetypes = {
	aac: 'audio/aac',
	abw: 'application/x-abiword',
	arc: 'application/octet-stream',
	avi: 'video/x-msvideo',
	azw: 'application/vnd.amazon.ebook',
	bin: 'application/octet-stream',
	bz: 'application/x-bzip',
	bz2: 'application/x-bzip2',
	csh: 'application/x-csh',
	css: 'text/css',
	csv: 'text/csv',
	doc: 'application/msword',
	docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	eot: 'application/vnd.ms-fontobject',
	epub: 'application/epub+zip',
	es: 'application/ecmascript',
	gif: 'image/gif',
	htm: 'text/html',
	html: 'text/html',
	ico: 'image/x-icon',
	ics: 'text/calendar',
	jar: 'application/java-archive',
	jpeg: 'image/jpeg',
	jpg: 'image/jpeg',
	js: 'application/javascript',
	json: 'application/json',
	mid: 'audio/midi',
	midi: 'audio/midi',
	mpeg: 'video/mpeg',
	mpkg: 'application/vnd.apple.installer+xml',
	odp: 'application/vnd.oasis.opendocument.presentation',
	ods: 'application/vnd.oasis.opendocument.spreadsheet',
	odt: 'application/vnd.oasis.opendocument.text',
	oga: 'audio/ogg',
	ogv: 'video/ogg',
	ogx: 'application/ogg',
	otf: 'font/otf',
	png: 'image/png',
	pdf: 'application/pdf',
	ppt: 'application/vnd.ms-powerpoint',
	pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	rar: 'application/x-rar-compressed',
	rtf: 'application/rtf',
	sh: 'application/x-sh',
	svg: 'image/svg+xml',
	swf: 'application/x-shockwave-flash',
	tar: 'application/x-tar',
	tif: 'image/tiff',
	tiff: 'image/tiff',
	ts: 'application/typescript',
	ttf: 'font/ttf',
	vsd: 'application/vnd.visio',
	wav: 'audio/wav',
	weba: 'audio/webm',
	webm: 'video/webm',
	webp: 'image/webp',
	woff: 'font/woff',
	woff2: 'font/woff2',
	xhtml: 'application/xhtml+xml',
	xls: 'application/vnd.ms-excel',
	xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	xml: 'application/xml',
	xul: 'application/vnd.mozilla.xul+xml',
	zip: 'application/zip',
	'3gp': 'video/3gpp',
	'3g2': 'video/3gpp2',
	'7z': 'application/x-7z-compressed',
};

const getMimetype = (filename) => {
	let test = filename.split(/.+\./),
		mime = (Array.isArray(test) && test[1] && mimetypes[test[1]]) ? mimetypes[test[1]] : 'text/plain';
	return mime;
};

module.exports = {
	getS3Handle: getS3Handle,
	pushFolderContentsToS3: pushFolderContentsToS3,
	createZip: createZip,
};
