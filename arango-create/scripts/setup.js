'use strict';

const db = require('@arangodb').db;

const users = module.context.collectionName('Users');
const archives = module.context.collectionName('UserArchives');
const auths = module.context.collectionName('UserAuths');
const secrets = module.context.collectionName('UserSecrets');
const tokens = module.context.collectionName('UserTokens');

let newCollection;

if (!db._collection(users)) {
	newCollection = db._createDocumentCollection(users);

	newCollection.ensureIndex({ 
		type: "hash", 
		unique: true,
		sparse: true,
		deduplicate: false,
		fields: ['email'] 
	});

	newCollection.ensureIndex({ 
		type: "hash", 
		unique: true,
		sparse: false,
		deduplicate: false,
		fields: ['userName'] 
	});
}

if (!db._collection(archives)) {
	db._createDocumentCollection(archives);
}

if (!db._collection(auths)) {
	db._createDocumentCollection(auths);
}

if (!db._collection(secrets)) {
	db._createDocumentCollection(secrets);
}

if (!db._collection(tokens)) {
	db._createDocumentCollection(tokens);
}

