const defaultDist = require('../shared/iou-distance');
const assignement = require('../shared/assignement');

/**
* List the indexes that are truthy for both
* @param {Array.<Any>} first
* @param {Array.<Any>} second
* @returns {Array.<Number>}
*/
const intersection = function (first, second) {
	const frameIndexes = [first, second]
		.map(b => b.map((value, index) => ({value, index}))
			.filter(({value}) => value)
			.map(({index}) => index));

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
	/**
	* @typedef {Object} DetailedDist
	* @property {Number} fp
	* @property {Number} fn
	*/
	/**
	* return the number of unmatching {fp, fn} items
	* @param {Array.<Any>} gt
	* @param {Array.<Any>} prediction
	* @returns {DetailedDist}
	*/
	const detailedDistFn = function (gt, pred) {
		const inter = intersection(gt, pred);
		const spatialMatches = inter.filter(index => distFn(mapFn(gt[index]), mapFn(pred[index])) < threshold);
		const [fp, fn] = [gt, pred].map(b => (b.filter(a => a).length - spatialMatches.length));
		return {
			fp,
			fn
		};
	};

	/**
	* If gtIndex and predIndex are both defined, return the number of unmatching (fp + fn) items
	* if both are not defined, return 0
	* if one is defined return corresponding length (all considered as fp or fn)
	* @param {GtNode} {gtIndex}
	* @param {PdNode} {predIndex}
	* @returns {Number}
	*/

	const binaryDistFn = function ({gtIndex}, {predIndex}) {
		if (typeof (gtIndex) === 'number' && typeof (predIndex) === 'number') {
			const details = detailedDistFn(groundTruths[gtIndex], predictions[predIndex]);
			return details.fn + details.fp;
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

	const sum = array => array.reduce((a, b) => a + b, 0);
	// MT and MC is the paper
	const idtpSet = matched.filter(({indexes}) => typeof (vt[indexes[0]].gtIndex) === 'number' && typeof (vc[indexes[1]].predIndex) === 'number');

	const idfn = sum(idtpSet.map(({indexes}) => detailedDistFn(groundTruths[vt[indexes[0]].gtIndex], predictions[vc[indexes[1]].predIndex]).fn));
	const idfp = sum(idtpSet.map(({indexes}) => detailedDistFn(groundTruths[vt[indexes[0]].gtIndex], predictions[vc[indexes[1]].predIndex]).fp));

	const idtp1 = sum(groundTruths.map(g => g.length));
	const idtp2 = sum(predictions.map(p => p.length));

	if (idtp1 !== idtp2) {
		throw (new Error('Should verify (8) : IDTP = Sum(τ∈AT, len(τ) − IDFN) = Sum(γ∈AC, len(γ) − IDFP)'));
	}

	return {idtp: idtp1, idfp, idfn, match};
};
