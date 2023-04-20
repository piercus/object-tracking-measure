const nonNullIndexes = require('../shared/non-null-indexes');
const trackDist = require('../shared/track-dist');
const idShared = require('../shared/id-shared');

/**
* List the indexes that are truthy for both
* @param {Array or number}
* @param {Array or number}
* @returns {number}
*/

const euclidean = function (a, b) {
	if (a.length !== b.length) {
		throw (new Error('same dimension'));
	}

	let sum = 0;
	a.forEach((_, i) => {
		sum += (a[i] - b[i]) ** 2;
	});
	return Math.sqrt(sum);
};

/**
* List the indexes that are truthy for both
* @param {Array or number} box1
* @param {Array or number} box2
* @returns {number}
*/

const distanceBox = function (box1, box2) {
	let distance = 0;
	if (typeof (box1) === 'number' && typeof (box2) === 'number') {
		distance = euclidean([box1], [box2]);
	} else if (box1 !== null && box2 !== null) {
		distance = euclidean(box1.slice(0, 2), box2.slice(0, 2));
	}

	return distance;
};

/**
* List the indexes that are truthy for both
* @param {Array} trajectory
* @returns {number}
*/

const distanceTraveled = function (trajectory) {
	let sum = 0;
	// If trajectory is not definied
	if (trajectory === null) {
		return 0;
	}

	for (let i = 1; i < trajectory.length; i++) {
		sum += distanceBox(trajectory[i], trajectory[i - 1]);
	}

	return sum;
};

/**
* @typedef {Object} IdEuclResult
* @property {Number} idEucl
* @property {Array.<[Number, Number]>} match [groundTruthIndex, predictionIndex] list
*/
/**
* List the indexes that are truthy for both
* @param {TrackDistOptions} opts see trackDist
* @param {Array.<Array.<Any>>} opts.groundTruths
* @param {Array.<Array.<Any>>} opts.predictions
* @param {Object} opts.logger console-like (or winston-like) interface for logging
* @returns {IdEuclResult}
*/

module.exports = function (options) {
	const {groundTruths, predictions, logger} = options;
	const ntraveld = Math.max(...groundTruths.map(a => distanceTraveled(a)));

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

	const maxCost = ntraveld;
	const detailedDistFn = (gt, pred) => trackDist.detailed(gt, pred, options);

	/**
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
			const spatialMatches = details.matchIndexes;
			let distanceTravel = 0;
			for (const item of spatialMatches) {
				if (item > 0 && groundTruths[gtIndex][item - 1] !== null && groundTruths[gtIndex][item] !== null) {
					distanceTravel += distanceBox(groundTruths[gtIndex][item - 1], groundTruths[gtIndex][item]);
				}
			}

			details.dTravel = distanceTravel;
		} else if (typeof (gtIndex) === 'number') {
			const fnIndexes = nonNullIndexes(groundTruths[gtIndex]);
			const fn = fnIndexes.length;
			details = {
				fpIndexes: [],
				fnIndexes,
				fn,
				fp,
				dTravel: 0,
			};
		} else if (typeof (predIndex) === 'number') {
			const fpIndexes = nonNullIndexes(predictions[predIndex]);
			const fp = fpIndexes.length;
			details = {
				fnIndexes: [],
				fpIndexes,
				fn,
				fp,
				dTravel: 0,
			};
		} else {
			details = {
				fnIndexes: [],
				fpIndexes: [],
				fn,
				fp,
				dTravel: 0,
			};
		}

		return details;
	};

	const distFn = (a, b) => {
		const dTravel = -binaryDistFn(a, b).dTravel;
		return dTravel;
	};

	const sum = array => array.reduce((a, b) => a + b, 0);
	const {match, gtMatch, tpPd: idEucltpIndexesPred, tpGT: idEucltpIndexesGt, fpIdx: idEuclfpIndexes, fnIdx: idEuclfnIndexes} = idShared.idDetails(groundTruths, predictions, {maxCost}, distFn, binaryDistFn);

	const dTravel = sum(groundTruths.map((_, gtIndex) => binaryDistFn({gtIndex}, gtMatch[gtIndex]).dTravel));
	const trueD = sum(groundTruths.map((_, gtIndex) => distanceTraveled(groundTruths[gtIndex])));

	const idEucl = dTravel / trueD;
	const result = {idEucl, match, idEuclfpIndexes, idEuclfnIndexes, idEucltpIndexesPred, idEucltpIndexesGt};
	if (logger) {
		logger.debug('IdEucl details :', result);
	}

	return result;
};
