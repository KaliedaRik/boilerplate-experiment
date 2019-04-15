// require the tests data
const validateData = require('./validateData.js');


// change the validations data source
test('VAL-01 loading validations data will fail', () => {
	let result = validateData.setValidationsTo('validations-this-file-does-not-exist');
	expect(result).toBeFalsy();
});

test('VAL-02 loading validations data will succeed', () => {
	let result = validateData.setValidationsTo('validations-testdata');
	expect(result).toBeTruthy();
});


// pass/fail tests for individual validation types
// - most of these tests are too simple to be useful

// test('VAL-03 required validation will pass', () => {
// 	let result = validateData.testField('tests', 'testRequired', 'foo');
// 	expect(result).toBeTruthy();
// });

// test('VAL-04 required validation will fail', () => {
// 	let result = validateData.testField('tests', 'testRequired');
// 	expect(result).toBeFalsy();
// });

// test('VAL-05 isNumber validation will pass', () => {
// 	let result = validateData.testField('tests', 'testIsNumber', 1);
// 	expect(result).toBeTruthy();
// });

// test('VAL-06 isNumber validation will fail', () => {
// 	let result = validateData.testField('tests', 'testIsNumber', 'one');
// 	expect(result).toBeFalsy();
// });

// test('VAL-07 isInteger validation will pass', () => {
// 	let result = validateData.testField('tests', 'testIsInteger', 1);
// 	expect(result).toBeTruthy();
// });

// test('VAL-08 isInteger validation will fail', () => {
// 	let result = validateData.testField('tests', 'testIsInteger', 1.1);
// 	expect(result).toBeFalsy();
// });

// test('VAL-09 isString validation will pass', () => {
// 	let result = validateData.testField('tests', 'testIsString', 'hello');
// 	expect(result).toBeTruthy();
// });

// test('VAL-10 isString validation will fail', () => {
// 	let result = validateData.testField('tests', 'testIsString', true);
// 	expect(result).toBeFalsy();
// });

// test('VAL-11 isBoolean validation will pass', () => {
// 	let result = validateData.testField('tests', 'testIsBoolean', false);
// 	expect(result).toBeTruthy();
// });

// test('VAL-12 isBoolean validation will fail', () => {
// 	let result = validateData.testField('tests', 'testIsBoolean', 'Hello');
// 	expect(result).toBeFalsy();
// });

// test('VAL-13 isIncludedIn validation will pass', () => {
// 	let result = validateData.testField('tests', 'testIsIncludedIn', 'Hello');
// 	expect(result).toBeTruthy();
// });

// test('VAL-14 isIncludedIn validation will fail', () => {
// 	let result = validateData.testField('tests', 'testIsIncludedIn', 'hello');
// 	expect(result).toBeFalsy();
// });

// test('VAL-15 minLength validation will pass', () => {
// 	let result = validateData.testField('tests', 'testMinLength', 'Hello');
// 	expect(result).toBeTruthy();
// });

// test('VAL-16 minLength validation will fail', () => {
// 	let result = validateData.testField('tests', 'testMinLength', 'Hell');
// 	expect(result).toBeFalsy();
// });

// test('VAL-17 maxLength validation will pass', () => {
// 	let result = validateData.testField('tests', 'testMaxLength', 'Hello');
// 	expect(result).toBeTruthy();
// });

// test('VAL-18 maxLength validation will fail', () => {
// 	let result = validateData.testField('tests', 'testMaxLength', 'Helloa');
// 	expect(result).toBeFalsy();
// });

// test('VAL-19 minValue validation will pass', () => {
// 	let result = validateData.testField('tests', 'testMinValue', 5);
// 	expect(result).toBeTruthy();
// });

// test('VAL-20 minValue validation will fail', () => {
// 	let result = validateData.testField('tests', 'testMinValue', 4);
// 	expect(result).toBeFalsy();
// });

// test('VAL-21 maxValue validation will pass', () => {
// 	let result = validateData.testField('tests', 'testMaxValue', 5);
// 	expect(result).toBeTruthy();
// });

// test('VAL-22 maxValue validation will fail', () => {
// 	let result = validateData.testField('tests', 'testMaxValue', 6);
// 	expect(result).toBeFalsy();
// });

// test('VAL-23 includes validation will pass', () => {
// 	let result = validateData.testField('tests', 'testIncludes', 'Hello');
// 	expect(result).toBeTruthy();
// });

// test('VAL-24 includes validation will fail', () => {
// 	let result = validateData.testField('tests', 'testIncludes', 'hello');
// 	expect(result).toBeFalsy();
// });

// test('VAL-25 regex validation will pass', () => {
// 	let result = validateData.testField('tests', 'testRegex', 'Hello World');
// 	expect(result).toBeTruthy();
// });

// test('VAL-26 regex validation will fail', () => {
// 	let result = validateData.testField('tests', 'testRegex', 'Hello ');
// 	expect(result).toBeFalsy();
// });

// test('VAL-27 unexpected test validation will fail', () => {
// 	let result = validateData.testField('tests', 'testUnknown', true);
// 	expect(result).toBeFalsy();
// });

// pass/fail tests for functions that test a suite of values
test('VAL-28 checkForExpectedFields() will pass', () => {
	let result = validateData.checkForExpectedFields('testForm', {
		test1: 5,
		test2: 'Hello',
		test3: true
	});
	expect(result).toBeTruthy();
});

test('VAL-29 checkForExpectedFields() with additional field will fail', () => {
	let result = validateData.checkForExpectedFields('testForm', {test4: true});
	expect(result).toBeFalsy();
});

// no need to test getFormTestResults() as testForm() will call that function to complete its own validation work

test('VAL-30 testForm() will pass', () => {
	let result = validateData.testForm('testForm', {
		test1: 5,
		test2: 'Hello',
		test3: true
	});
	expect(result).toBeTruthy();
});

test('VAL-31 testForm() will fail', () => {
	let result = validateData.testForm('testForm', {
		test1: 4,
		test2: 'Hello',
		test3: true
	});
	expect(result).toBeFalsy();
});

test('VAL-32 testForm() with missing non-required fields will pass', () => {
	let result = validateData.testForm('testForm', {
		test1: 5
	});
	expect(result).toBeTruthy();
});

test('VAL-33 testForm() with missing required fields will fail', () => {
	let result = validateData.testForm('testForm', {
		test2: 'Hello',
		test3: true
	});
	expect(result).toBeFalsy();
});

