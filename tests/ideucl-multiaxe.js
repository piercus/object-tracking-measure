const otm = require('..');
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

test('idEucl on simple example', t => {
	const result = otm.idEucl({
		groundTruths,
		predictions
	});
	t.true(result === 1);
});
