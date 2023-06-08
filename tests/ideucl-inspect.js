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

const expected = '--\nGroundTruth[1]✓―――――――――――――――――――――――――――✓?―――――――――――――――――――――――――――?✓――――――――――――――――――――――――――✓\nPrediction[1] ✓―――――――――――――――――――――――――――✓?―――――――――――――――――――――――――――?✓――――――――――――――――――――――――――✓\n              |----------------------------|----------------------------|---------------------------\n              0                            1                            2                           \n\n';

test('idEuclInspect on simple example', t => {
	const result = otm.idEuclDetails({
		groundTruths,
		predictions,
	});

	const string1 = otm.idEuclInspect(Object.assign({}, result, {
		columns: 100,
	}));
	t.is(typeof (string1), 'string');
	t.is(string1, expected);
});
