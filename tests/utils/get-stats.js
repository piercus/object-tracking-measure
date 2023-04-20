const otm = require('../..');
const test = require('ava');
const groundTruthTrack = [
	[22, 33, 20, 20], // X, y, w, h
	null,
	[25, 35, 20, 20],
	[39, 41, 20, 20],
	null
];

test('getStats on simple example', t => {
	const result = otm.getStats({
		track: groundTruthTrack
	});
	const {count, age, fullDensity, gapDensity, firstIndex, lastIndex} = result;
	t.is(count, 3);
	t.is(age, 1);
	t.is(fullDensity, 0.6);
	t.is(gapDensity, 1 / 3);
	t.is(firstIndex, 0);
	t.is(lastIndex, 3);
});
