
const nonNullIndexes = require('../shared/non-null-indexes');
const trackDist = require('../shared/track-dist');
const idShared = require('../shared/id-shared');

/**
* @typedef {Object} IdDetailsResult
* @property {Number} idtp
* @property {Number} idfp
* @property {Number} idfn
* @property {Array.<[Number, Number]>} match [groundTruthIndex, predictionIndex] list
* @property {Array.<Array.<Number>>} idfnIndexes byFrame list of groundTruth which are considered as non-matching is this frame
* @property {Array.<Array.<Number>>} idfpIndexes byFrame list of predictions which are considered as non-matching is this frame
* @property {Array.<Array.<Number>>} idtpIndexesPred byFrame list of predictions which are considered as matching is this frame
* @property {Array.<Array.<Number>>} idtpIndexesGt byFrame list of groundTruth which are considered as matching is this frame
*/
/**
* List the indexes that are truthy for both
* @param {TrackDistOptions} opts see trackDist
* @param {Array.<Array.<Any>>} opts.groundTruths
* @param {Array.<Array.<Any>>} opts.predictions
* @param {Object} opts.logger console-like (or winston-like) interface for logging
* @returns {IdDetailsResult}
*/
module.exports = function (options) {
	const {groundTruths, predictions, logger} = options;
	const all = groundTruths.concat(predictions);
	const nFrames = Math.max(...all.map(a => a.length));
	// Naming comes from https://arxiv.org/pdf/1609.01775.pdf

	groundTruths.forEach((g, i) => {
		if (g.filter(a => a !== null).length === 0) {
			throw (new Error(`Empty groundTruth track at index ${i}`));
		}
	});
	predictions.forEach((p, i) => {
		if (p.filter(a => a !== null).length === 0) {
			throw (new Error(`Empty prediction track at index ${i}`));
		}
	});

	const maxCost = nFrames * 2;
	const detailedDistFn = (gt, pred) => trackDist.detailed(gt, pred, options);

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
				fp,
			};
		} else if (typeof (predIndex) === 'number') {
			const fpIndexes = nonNullIndexes(predictions[predIndex]);
			const fp = fpIndexes.length;
			details = {
				fnIndexes: [],
				fpIndexes,
				fn,
				fp,
			};
		} else {
			details = {
				fnIndexes: [],
				fpIndexes: [],
				fn,
				fp,
			};
		}

		return details;
	};

	const distFn = (a, b) => {
		const {fp, fn} = binaryDistFn(a, b);
		return fp + fn;
	};

	const sum = array => array.reduce((a, b) => a + b, 0);
	const {match, predMatch, gtMatch, tpPd: idtpIndexesPred, tpGT: idtpIndexesGt, fpIdx: idfpIndexes, fnIdx: idfnIndexes} = idShared.idDetails(groundTruths, predictions, {maxCost}, distFn, binaryDistFn);

	const idfn = sum(groundTruths.map((_, gtIndex) => binaryDistFn({gtIndex}, gtMatch[gtIndex]).fn));
	const idfp = sum(predictions.map((_, predIndex) => binaryDistFn(predMatch[predIndex], {predIndex}).fp));

	const idtp1 = sum(groundTruths.map(p => p.filter(a => a !== null).length)) - idfn;
	const idtp2 = sum(predictions.map(g => g.filter(a => a !== null).length)) - idfp;

	if (idtp1 !== idtp2) {
		throw (new Error('Should verify (8) : IDTP = Sum(τ∈AT, len(τ) − IDFN) = Sum(γ∈AC, len(γ) − IDFP)'));
	}

	const result = {idtp: idtp1, idfp, idfn, match, idfnIndexes, idfpIndexes, idtpIndexesGt, idtpIndexesPred};
	if (logger) {
		logger.debug('Idf1 details :', result);
	}

	return result;
};
