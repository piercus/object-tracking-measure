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

const nonNullIndexes = array => {
	return array
		.map((value, index) => ({value, index}))
		.filter(({value}) => value !== null)
		.map(({index}) => index);
};

module.exports = function (options) {
	const {groundTruths, predictions, distFn = defaultDist, threshold = 0.5, mapFn = (o => o), logger} = options;
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
		const [fn, fp] = [gt, pred].map(b => (b.filter(a => a).length - spatialMatches.length));

		return {
			fp,
			matchIndexes: spatialMatches,
			fpIndexes: nonNullIndexes(pred).filter(index => !spatialMatches.includes(index)),
			fnIndexes: nonNullIndexes(gt).filter(index => !spatialMatches.includes(index)),
			gtL: gt.filter(a => a).length,
			predL: pred.filter(a => a).length,
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
		const fp = 0;
		const fn = 0;
		let details = {};
		if (typeof (gtIndex) === 'number' && typeof (predIndex) === 'number') {
			details = detailedDistFn(groundTruths[gtIndex], predictions[predIndex]);
		} else if (typeof (gtIndex) === 'number') {
			const fnIndexes = nonNullIndexes(groundTruths[gtIndex]);
			const fn = fnIndexes.length;
			details = {
				fpIndexes: [],
				fnIndexes,
				fn,
				fp
			};
		} else if (typeof (predIndex) === 'number') {
			const fpIndexes = nonNullIndexes(predictions[predIndex]);
			const fp = fpIndexes.length;
			details = {
				fnIndexes: [],
				fpIndexes,
				fn,
				fp
			};
		} else {
			details = {
				fnIndexes: [],
				fpIndexes: [],
				fn,
				fp
			};
		}

		return details;
	};

	const {matched, unmatched} = assignement(
		vt,
		vc,
		{
			threshold: maxCost * 2,
			distFn: (a, b) => {
				const {fp, fn} = binaryDistFn(a, b);
				return fp + fn;
			}
		}
	);

	if (unmatched[0].length > 0 || unmatched[1].length > 0) {
		console.log({unmatched, maxCost});
		throw (new Error('ID metrics should not have unmatched assignement'));
	}

	// Console.log(matched.map(({indexes}) => [indexes, typeof(vt[indexes[0]].gtIndex) === 'number', typeof(vc[indexes[1]].predIndex) === 'number']))
	const idtpSet = matched.filter(({indexes}) => typeof (vt[indexes[0]].gtIndex) === 'number' && typeof (vc[indexes[1]].predIndex) === 'number');

	const match = idtpSet.map(({indexes}) => [vt[indexes[0]].gtIndex, vc[indexes[1]].predIndex]);

	const sum = array => array.reduce((a, b) => a + b, 0);

	const gtMatch = [];
	const predMatch = [];

	matched.forEach(({indexes}) => {
		if (typeof (vt[indexes[0]].gtIndex) === 'number') {
			gtMatch[vt[indexes[0]].gtIndex] = vc[indexes[1]];
		}

		if (typeof (vc[indexes[1]].predIndex) === 'number') {
			predMatch[vc[indexes[1]].predIndex] = vt[indexes[0]];
		}
	});
	console.log('there');

	const idfn = sum(groundTruths.map((_, gtIndex) => binaryDistFn({gtIndex}, gtMatch[gtIndex]).fn));
	const idfp = sum(predictions.map((_, predIndex) => binaryDistFn(predMatch[predIndex], {predIndex}).fp));

	const idfnIndexes = groundTruths.map((_, gtIndex) => binaryDistFn({gtIndex}, gtMatch[gtIndex]).fnIndexes);
	const idfpIndexes = predictions.map((_, predIndex) => binaryDistFn(predMatch[predIndex], {predIndex}).fpIndexes);

	const idtp1 = sum(groundTruths.map(p => p.filter(a => a).length)) - idfn;
	const idtp2 = sum(predictions.map(g => g.filter(a => a).length)) - idfp;
	const idtpIndexesGt = groundTruths.map((p, gtIndex) => nonNullIndexes(p).filter(index => !idfnIndexes[gtIndex].includes(index)));
	const idtpIndexesPred = predictions.map((p, predIndex) => nonNullIndexes(p).filter(index => !idfpIndexes[predIndex].includes(index)));

	if (idtp1 !== idtp2) {
		throw (new Error('Should verify (8) : IDTP = Sum(τ∈AT, len(τ) − IDFN) = Sum(γ∈AC, len(γ) − IDFP)'));
	}

	const result = {idtp: idtp1, idfp, idfn, match, idfnIndexes, idfpIndexes, idtpIndexesGt, idtpIndexesPred};
	if (logger) {
		logger.debug('Idf1 details :', result);
	}

	return result;
};
