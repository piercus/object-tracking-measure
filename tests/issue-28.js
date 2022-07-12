const otm = require('..');
const fs = require('fs');
const test = require('ava');
const groundTruths = [

		[0, 1, 2, 3, 4] // X, y, w, h

];

const predictions = [
  [4, 3, 2, 1, 0] ,// X, y, w, h
  [null, 0, 2, null, 0]
];

test('idf1 for #27', t => {
	const result = otm.idf1({
		groundTruths,
		predictions,
    distFn : (a,b) => Math.abs(a-b),
    threshold : 0.5
	});
	t.pass()
});
