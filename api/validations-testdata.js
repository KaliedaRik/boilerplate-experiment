module.exports = {

	tests: {
		testRequired: {required: true},
		testIsNumber: {isNumber: true},
		testIsInteger: {isInteger: true},
		testIsString: {isString: true},
		testIsBoolean: {isBoolean: true},
		testIsIncludedIn: {isIncludedIn: [5, 'Hello']},
		testMinLength: {minLength: 5},
		testMaxLength: {maxLength: 5},
		testMinValue: {minValue: 5},
		testMaxValue: {maxValue: 5},
		testIncludes: {includes: /[A-Z]/},
		testRegex: {regex: /Hello\s.+/},
		testUnknown: {bar: true},
	},

	testForm: {
		test1: {
			required: true,
			isNumber: true,
			isInteger: true,
			minValue: 5,
			maxValue: 5
		},
		test2: {
			isString: true,
			minLength: 5,
			maxLength: 5,
			includes: /[A-Z]/,
			isIncludedIn: ['Hello'],
			regex: /Hello/
		},
		test3: {
			isBoolean: true
		},
	},
};
