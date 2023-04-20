const test = require('ava');
const otm = require('..');

const groundTruths = [
	[
		[22, 33, 20, 20], // X, y, w, h
		[22, 33, 20, 20],
		[22, 33, 20, 20],
		[22, 33, 20, 20],
	],
	[
		[22, 33, 20, 20], // X, y, w, h
		null,
		[25, 35, 20, 20],
		[39, 41, 20, 20],
	],
];

const predictions = [
	[
		[23, 33, 22, 20], // X, y, w, h
		[21, 35, 20, 26],
		[23, 33, 22, 20],
		[21, 35, 20, 26],
	],
	[
		[23, 33, 20, 20], // X, y, w, h
		null,
		[23, 35, 22, 20],
		[39, 35, 20, 26],
	],
];

test('mota on simple example', t => {
	const result = otm.mota({
		groundTruths,
		predictions,
	});

	t.true(Math.abs(result - 0.714_285_714_285_714_3) < 1e-6);
});
test('mota on real life', t => {
	const data = require('./data/real-life5.json'); // eslint-disable-line ava/no-import-test-files
	const result = otm.mota(data);
	t.true(result < 0);
});
