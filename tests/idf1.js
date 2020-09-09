const otm = require('..');
const fs = require('fs');
const test = require('ava');
const groundTruths = [
	[
		[22, 33, 20, 20], // X, y, w, h
		[22, 33, 20, 20],
		[22, 33, 20, 20],
		[22, 33, 20, 20]
	],
	[
		[22, 33, 20, 20], // X, y, w, h
		null,
		[25, 35, 20, 20],
		[39, 41, 20, 20]
	]
];

const predictions = [
	[
		[23, 33, 22, 20], // X, y, w, h
		[21, 35, 20, 26],
		[23, 33, 22, 20],
		[21, 35, 20, 26]
	],
	[
		[23, 33, 20, 20], // X, y, w, h
		null,
		[23, 35, 22, 20],
		[39, 35, 20, 26]
	]
];

test('idf1 on simple example', t => {
	const result = otm.idf1({
		groundTruths,
		predictions
	});
	t.true(Math.abs(result - 1) < 1e-6);
});

test('idf1 on real-life example', t => {
	const options = JSON.parse(fs.readFileSync('./tests/data/real-life.json').toString());
	const result = otm.idf1(options);
	t.true(Math.abs(result - 1) > 1e-6);
});
test('idf1 on real-life example 2', t => {
	const options = JSON.parse(fs.readFileSync('./tests/data/real-life2.json').toString());
	const result = otm.idf1(options);
	t.true(Math.abs(result - 1) > 1e-6);
});