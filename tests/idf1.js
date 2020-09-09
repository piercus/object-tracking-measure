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

test('idf1 on basic example', t => {
	const trackGenerator = function (l, start = 1, end = 50, nullProb = 0.1) {
		const range = end - start;
		return new Array(l).fill(0).map(() => {
			const isNull = Math.random() < nullProb;
			if (isNull) {
				return null;
			}

			return new Array(4).fill(0).map(() => Math.floor(Math.random() * range) + start);
		});
	};

	const trackLength = 50;
	const nTrack = 10;
	const nTrackPredicted = 2;
	const groundTruths = new Array(nTrack).fill(0).map(() => trackGenerator(trackLength));

	const predictions = groundTruths.slice(0, nTrackPredicted).map(track => track.map(b => b && b.concat()));
	const {idfp, idfn, idtp} = otm.idDetails({groundTruths, predictions});
	t.is(idfp, 0);
	t.is(idfn, groundTruths.slice(nTrackPredicted).map(track => track.filter(a => a).length).reduce((a, b) => a + b, 0));
	t.is(idtp, predictions.map(track => track.filter(a => a).length).reduce((a, b) => a + b, 0));
});
