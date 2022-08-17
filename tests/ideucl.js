const otm = require('..');
const test = require('ava');
const groundTruths = [

	[0,
		26.25,
		52.5,
		78.75,
		105,
		130,
		155,
		180,
		205,
		230,
		258.6666667,
		287.3333333,
		316,
		344.6666667,
		373.3333333,
		402,
		421.3333333,
		440.6666667,
		460,
		474.2857143,
		488.5714286,
		502.8571429,
		517.1428571,
		531.4285714,
		545.7142857,
		560,
		570,
		580,
		590,
		600]

];

// Example 1 idf1 = 0.5 and ideucl = 0.37
const predictionsA = [

	[0,
		26.25,
		52.5,
		78.75,
		10,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null],

	[null,
		null,
		null,
		null,
		105,
		130,
		155,
		180,
		205,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null],

	[null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		230,
		258.6666667,
		287.3333333,
		316,
		344.6666667,
		373.3333333,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null],

	[null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		402,
		421.3333333,
		440.6666667,
		460,
		474.2857143,
		488.5714286,
		502.8571429,
		517.1428571,
		531.4285714,
		545.7142857,
		560,
		570,
		580,
		590,
		600]
];

test('idEucl on track A', t => {
	const result = otm.idEucl({
		groundTruths,
		predictions: predictionsA,
		distFn: (a, b) => Math.abs(a - b),
		threshold: 0.5
	});
	t.true(Math.abs(result - 0.37) < 1e-1);
});

// Example 2 idf1 = 0.5 and ideucl = 0.67

const predictionsB = [

	[0,
		26.25,
		52.5,
		78.75,
		105,
		130,
		155,
		180,
		205,
		230,
		258.6666667,
		287.3333333,
		316,
		344.6666667,
		373.3333333,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null],

	[null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		402,
		421.3333333,
		440.6666667,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null],

	[null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		460,
		474.2857143,
		488.5714286,
		502.8571429,
		517.1428571,
		531.4285714,
		545.7142857,
		null,
		null,
		null,
		null,
		null],

	[null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		560,
		570,
		580,
		590,
		600]
];

test('idEucl on track B', t => {
	const result = otm.idEucl({
		groundTruths,
		predictions: predictionsB,
		distFn: (a, b) => Math.abs(a - b),
		threshold: 0.5
	});
	t.true(Math.abs(result - 0.62) < 1e-1);
});
