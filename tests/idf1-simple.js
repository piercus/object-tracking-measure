const otm = require('..');
const test = require('ava');
const groundTruths = [
	[
		[1, 0, 1, 1], // X, y, w, h
		[3, 0, 1, 1],
		[5, 0, 1, 1],
		[4, 0, 1, 1],
		[3, 0, 1, 1]
	],
	[
		[1, 0, 1, 1], // X, y, w, h
		[2, 0, 1, 1],
		[5, 0, 1, 1],
		[4, 0, 1, 1],
		[3, 0, 1, 1]
	]
];

const predictions = [
	[
		[1, 0, 1, 1], // X, y, w, h
		[3, 0, 1, 1],
		[5, 0, 1, 1],
		[3, 0, 1, 1],
		[4, 0, 1, 1]
	],
	[
		[1, 0, 1, 1], // X, y, w, h
		[2, 0, 1, 1],
		[4, 0, 1, 1],
		[4, 0, 1, 1],
		[2, 0, 1, 1]
	]
];

test('idf1 on simple example', t => {
	const result = otm.idf1({
		groundTruths,
		predictions
	});
	t.true(result === 0.6); // Pour ideucl 0.67 exemple
});
