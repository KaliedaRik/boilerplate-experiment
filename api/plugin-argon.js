const securePassword = require('secure-password');
const argon = securePassword({
  memlimit: securePassword.MEMLIMIT_DEFAULT,
  opslimit: securePassword.OPSLIMIT_DEFAULT
});


// password encryption and comparison
const checkPassword = (pwd, hash) => {
	return new Promise((resolve, reject) => {

		let p = Buffer.from(pwd),
			h = Buffer.from(hash),
			updated;

		argon.verify(p, h, (err, res) => {
			if(err){
				resolve(false);
			}

			switch (res) {
				case securePassword.VALID :
					resolve(true);

				case securePassword.VALID_NEEDS_REHASH :
					// TODO: NEED A GOOD WAY to handle and save re-hashes
					// updated = encryptPassword(pwd);
					// if(updated){
					// 	resolve(updated);
					// }
					// else{
						resolve(true);
					// }
				default :
					resolve(false);
			}
		});
	});
};

const encryptPassword = (pwd) => {
	return new Promise((resolve, reject) => {

		let p = Buffer.from(pwd);

		argon.hash(p, (err, hash) => {
		    if(err){
		    	resolve(false);
		    }
		    resolve(hash.toString());
		});
	});
};


module.exports = {
	checkPassword,
	encryptPassword,
};
