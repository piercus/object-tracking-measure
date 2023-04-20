const test = require('ava');
const otm = require('../..');

const groundTruthTrack = [
	[22, 33, 20, 20], // X, y, w, h
	null,
	null,
	null,
	[25, 35, 20, 20],
	[39, 41, 20, 20],
	null,
];

test('fastGetNullSegment on simple example', t => {
	const result = otm.fastGetNullSegment({
		track: groundTruthTrack,
		iteration: 2,
	});
	t.is(result.first, 1);
	t.is(result.last, 4);
	t.is(result.type, 'null');
});
