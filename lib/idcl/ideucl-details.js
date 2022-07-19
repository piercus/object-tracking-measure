const assignement = require('../shared/assignement');
const trackDist = require('../shared/track-dist');

/**
* @typedef {Object} IdeuclResult
* @property {Number} ideucl
* @property {Array.<[Number, Number]>} match [groundTruthIndex, predictionIndex] list
*/
/**
* List the indexes that are truthy for both
* @param {TrackDistOptions} opts see trackDist
* @param {Array.<Array.<Any>>} opts.groundTruths
* @param {Array.<Array.<Any>>} opts.predictions
* @param {Object} opts.logger console-like (or winston-like) interface for logging
* @returns {IdeuclResult}
*/
/**
* List the indexes that are truthy for both
* @param {Array}
* @returns {number}
*/

const distanceTraveled = function (trajectory) {
	let sum = 0;
	for (let i = 1; i < trajectory.length; i++) {
		sum += Math.abs(trajectory[i] - trajectory[i - 1]);
	}

	return sum;
};

module.exports = function (options) {
	const {groundTruths, predictions, logger} = options;
	const ntraveld = Math.max(...groundTruths.map(a => distanceTraveled(a))); // Modified
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
	const vt = groundTruths.map((_, gtIndex) => ({gtIndex})).concat(predictions.map((_, fPredIndex) => ({fPredIndex})));
	const vc = groundTruths.map((_, fGtIndex) => ({fGtIndex})).concat(predictions.map((_, predIndex) => ({predIndex})));

	const maxCost = ntraveld; //  Modified
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
		if (typeof (gtIndex) === 'number' && typeof (predIndex) === 'number') {
			const spatialMatches = detailedDistFn(groundTruths[gtIndex], predictions[predIndex]).matchIndexes;
			let distanceTravel = 0;
			for (const item of spatialMatches) {
				if (item > 0 && groundTruths[gtIndex][item - 1] !== null && groundTruths[gtIndex][item] !== null) {
					distanceTravel += Math.abs(groundTruths[gtIndex][item - 1] - groundTruths[gtIndex][item]);
				}
			}

			return distanceTravel;
		}

		return 0;
	};

	const {matched, unmatched} = assignement(
		vt,
		vc,
		{
			threshold: maxCost,
			distFn: (a, b) => {
				return -binaryDistFn(a, b);
			}
		}

	);

	if (unmatched[0].length > 0 || unmatched[1].length > 0) {
		console.log({unmatched, maxCost});
		throw (new Error('ID metrics should not have unmatched assignement'));
	}

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

	const dTravel = sum(groundTruths.map((_, gtIndex) => binaryDistFn({gtIndex}, gtMatch[gtIndex])));
	const trueD = sum(groundTruths.map((_, gtIndex) => distanceTraveled(groundTruths[gtIndex])));

	const result = dTravel / trueD;
	if (logger) {
		logger.debug('Ideucl details :', result);
	}

	return result;
};
