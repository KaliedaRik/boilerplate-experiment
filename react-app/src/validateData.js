// server side
// var validations = require('./validations.js');

// client side
import * as validations from './validations.js';

// ---------------------------------------------------------------------- //

// SERVER SIDE ONLY! (used for Jest tests on the server side)
// change tests data source, for instance to the Jest test suite
// const setValidationsTo = (fileName) => {
// 	try{
// 		validations = require(`./${fileName}.js`);
// 		return true;
// 	}
// 	catch(e){
// 		return false;
// 	}
// }

// ---------------------------------------------------------------------- //

// perform the tests on a given field
const doTests = (items, value) => {

	let i, iz, itemKeys, type, test, temp,
		flag = true;

	itemKeys = Object.keys(items);

	// no tests required on field; return true
	if(!itemKeys.length) return true;

	for(i = 0, iz = itemKeys.length; i < iz; i++){
		type = itemKeys[i];
		test = items[type];

		if(type && test){

			// order is commoner tests first
			switch(type){

				case 'required' :
					if(value == null){
						flag = false;
					}
					else if(value.substring && !value){
						flag = false;
					}
					break;

				case 'minLength' :
					if(value != null){
						temp = (value.substring) ? value : String(value);
						if(temp.length < test){
							flag = false;
						}
					}
					break;

				case 'regex' :
					if(value != null){
						temp = (test.test) ? test : new RegExp(test);
						if (!temp.test(value)){
							flag = false;
						}
					}
					break;

				case 'maxLength' :
					if(value != null){
						temp = (value.substring) ? value : String(value);
						if(temp.length > test){
							flag = false;
						}
					}
					break;

				case 'minValue' :
					if(value != null){
						temp = (value.toFixed) ? value : Number(value);
						if(temp < test){
							flag = false;
						}
					}
					break;

				case 'maxValue' :
					if(value != null){
						temp = (value.toFixed) ? value : Number(value);
						if(temp > test){
							flag = false;
						}
					}
					break;

				case 'isIncludedIn' :
					if(value != null && Array.isArray(test) && test.indexOf(value) < 0){
						flag = false;
					}
					break;

				case 'includes' :
					if(value != null){
						temp = (value.substring) ? value : String(value);
						if(temp.search(test) < 0){
							flag = false;
						}
					}
					break;

				case 'isNumber' :
					if(value != null && !value.toFixed){
						flag = false;
					}
					break;

				case 'isInteger' :
					if(value != null){
						if(!value.toFixed){
							flag = false;
						}
						else if(value !== parseInt(value, 10)){
							flag = false;
						}
					}
					break;

				case 'isString' :
					if(value != null && !value.substring){
						flag = false;
					}
					break;

				case 'isBoolean' :
					if(value != null && typeof(value) !== typeof(true)){
						flag = false;
					}
					break;

				default :
					flag = false;
			}
		}
		else{
			flag = false;
		}

		if(!flag){
			break;
		}
	}
	return flag;
};

// ---------------------------------------------------------------------- //

// check that no additional/unexpected data has been included in the data object
const checkForExpectedFields = (formName, values) => {
	let form, formKeys, valueKeys,
		i, iz, key,
		flag = true;

	if(!formName || !values) return false;

	form = validations[formName] || [];
	formKeys = Object.keys(form);
	valueKeys = Object.keys(values);

	for(i = 0, iz = valueKeys.length; i < iz; i++){
		key = valueKeys[i];
		if(formKeys.indexOf(key) < 0){
			flag = false;
			break;
		}
	}
	return flag;
};

const getFormTestResults = (formName, values) => {

	let form, fields, i, iz, field,
		results = {};

	if(!formName || !values) return results;

	form = validations[formName];
	if(form){
		fields = Object.keys(form);

		for(i = 0, iz = fields.length; i < iz; i++){
			field = fields[i];
			results[field] = testField(formName, field, values[field]);
		}
	}
	return results;
};

// expecting formName and fieldName to be strings
const testField = (formName, fieldName, value) => {

	let tests, form;

	if(!formName || !fieldName) return false;

	form = validations[formName];
	if(form){
		tests = form[fieldName];
		if(tests){
			return doTests(tests, value);
		}
	}
	return false;
};

const testForm = (formName, values) => {

	let results = getFormTestResults(formName, values);

	if(!results) return false;

	return Object.values(results).every((item) => {return item});
};

// ---------------------------------------------------------------------- //

// server side
// module.exports = {
// 	checkForExpectedFields,
// 	getFormTestResults,
// 	setValidationsTo,
// 	testField,
// 	testForm
// };

// client side
export {
	checkForExpectedFields,
	getFormTestResults,
	testField,
	testForm
};
