const test = require('ava');
const otm = require('..');

const groundTruths = [
	[0, 1, 2, 3, 4],
];

const predictions = [
	[4, 3, 2, 1, 0],
	[null, 0, 2, null, 0],
];

test('idf1 for #28', t => {
	const result = otm.idf1({
		groundTruths,
		predictions,
		distFn: (a, b) => Math.abs(a - b),
		threshold: 0.5,
	});
	t.true(result > 0);
});
