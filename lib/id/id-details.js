const defaultDist = require('../shared/iou-distance');
const assignement = require('../shared/assignement');

const intersection = function (first, second) {
	const frameIndexes = [first, second].map(b => b.map((value, index) => ({value, index})).filter(({value}) => value).map(({index}) => index));
	return frameIndexes[0].filter(i0 => frameIndexes[1].includes(i0));
};

module.exports = function (options) {
	const {groundTruths, predictions, distFn = defaultDist, threshold = 0.5, mapFn = (o => o)} = options;
	const all = groundTruths.concat(predictions);
	const nFrames = Math.max(...all.map(a => a.length));
	// Naming comes from https://arxiv.org/pdf/1609.01775.pdf

	groundTruths.forEach((g, i) => {
		if (g.filter(a => a).length === 0) {
			throw (new Error(`Empty groundTruth track at index ${i}`));
		}
	});
	predictions.forEach((p, i) => {
		if (p.filter(a => a).length === 0) {
			throw (new Error(`Empty prediction track at index ${i}`));
		}
	});
	const vt = groundTruths.map((_, gtIndex) => ({gtIndex})).concat(predictions.map((_, fPredIndex) => ({fPredIndex})));
	const vc = groundTruths.map((_, fGtIndex) => ({fGtIndex})).concat(predictions.map((_, predIndex) => ({predIndex})));

	const maxCost = nFrames * 2;

	const binaryDistFn = function ({gtIndex}, {predIndex}) {
		if (typeof (gtIndex) === 'number' && typeof (predIndex) === 'number') {
			const inter = intersection(groundTruths[gtIndex], predictions[predIndex]);
			const spatialMatches = inter.filter(index => distFn(mapFn(groundTruths[gtIndex][index]), mapFn(predictions[predIndex][index])) < threshold);
			return [groundTruths[gtIndex], predictions[predIndex]].map(b => (b.filter(a => a).length - spatialMatches.length)).reduce((a, b) => a + b);
		}

		if (typeof (gtIndex) === 'number') {
			return groundTruths[gtIndex].filter(a => a).length;
		}

		if (typeof (predIndex) === 'number') {
			return predictions[predIndex].filter(a => a).length;
		}

		return 0;
	};

	const {matched, unmatched} = assignement(
		vt,
		vc,
		{
			threshold: maxCost * 2,
			distFn: (a, b) => binaryDistFn(a, b)
		}
	);

	if (unmatched[0].length > 0 || unmatched[1].length > 0) {
		console.log({unmatched, maxCost});
		throw (new Error('ID metrics should not have unmatched assignement'));
	}
	// Console.log(matched.map(({indexes}) => [indexes, typeof(vt[indexes[0]].gtIndex) === 'number', typeof(vc[indexes[1]].predIndex) === 'number']))

	const match = matched.filter(({indexes}) => typeof (vt[indexes[0]].gtIndex) === 'number' && typeof (vc[indexes[1]].predIndex) === 'number').map(({indexes}) => [vt[indexes[0]].gtIndex, vc[indexes[1]].predIndex]);
	const idtp = match.length;
	const idfn = matched.filter(({indexes}) => typeof (vt[indexes[0]].gtIndex) === 'number' && typeof (vc[indexes[1]].predIndex) !== 'number').length;
	const idfp = matched.filter(({indexes}) => typeof (vt[indexes[0]].gtIndex) !== 'number' && typeof (vc[indexes[1]].predIndex) === 'number').length;

	return {idtp, idfp, idfn, match};
};
