const assignement = require('../shared/assignement');

const nonNullIndexes = require('../shared/non-null-indexes');
const trackDist = require('../shared/track-dist');

/**
* List the indexes that are truthy for both
* @param {Array or number}
* @param {Array or number}
* @returns {number}
*/

const distancebox = function (box1, box2) {
	let distance = 0;
	if (typeof (box1) === 'number' && typeof (box2) === 'number') {
		distance = Math.abs(box1 - box2);
	} else if (box1 !== null && box2 !== null) {
		const xDistance = (box1[0] - box2[0]) ** 2;
		const yDistance = (box1[1] - box2[1]) ** 2;
		distance = (xDistance + yDistance) ** 0.5;
	}

	return distance;
};

/**
* List the indexes that are truthy for both
* @param {Array}
* @returns {number}
*/

const distanceTraveled = function (trajectory) {
	let sum = 0;
	if (trajectory === null) {
		return 0;
	}

	for (let i = 1; i < trajectory.length; i++) {
		sum += distancebox(trajectory[i], trajectory[i - 1]);
	}

	return sum;
};

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
		const fp = 0;
		const fn = 0;
		let details = {};
		if (typeof (gtIndex) === 'number' && typeof (predIndex) === 'number') {
			details = detailedDistFn(groundTruths[gtIndex], predictions[predIndex]);
			const spatialMatches = details.matchIndexes;
			let distanceTravel = 0;
			for (const item of spatialMatches) {
				if (item > 0 && groundTruths[gtIndex][item - 1] !== null && groundTruths[gtIndex][item] !== null) {
					distanceTravel += distancebox(groundTruths[gtIndex][item - 1], groundTruths[gtIndex][item]);
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
				dTravel: 0
			};
		} else if (typeof (predIndex) === 'number') {
			const fpIndexes = nonNullIndexes(predictions[predIndex]);
			const fp = fpIndexes.length;
			details = {
				fnIndexes: [],
				fpIndexes,
				fn,
				fp,
				dTravel: 0
			};
		} else {
			details = {
				fnIndexes: [],
				fpIndexes: [],
				fn,
				fp,
				dTravel: 0
			};
		}

		return details;
	};

	const {matched, unmatched} = assignement(
		vt,
		vc,
		{
			threshold: maxCost,
			distFn: (a, b) => {
				const dTravel = -binaryDistFn(a, b).dTravel;
				return dTravel;
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

	const ideucltpSet = matched.filter(({indexes}) => typeof (vt[indexes[0]].gtIndex) === 'number' && typeof (vc[indexes[1]].predIndex) === 'number');

	const match = ideucltpSet.map(({indexes}) => [vt[indexes[0]].gtIndex, vc[indexes[1]].predIndex]);

	const dTravel = sum(groundTruths.map((_, gtIndex) => binaryDistFn({gtIndex}, gtMatch[gtIndex]).dTravel));
	const trueD = sum(groundTruths.map((_, gtIndex) => distanceTraveled(groundTruths[gtIndex])));
	const ideuclfnIndexes = groundTruths.map((_, gtIndex) => binaryDistFn({gtIndex}, gtMatch[gtIndex]).fnIndexes);
	const ideuclfpIndexes = predictions.map((_, predIndex) => binaryDistFn(predMatch[predIndex], {predIndex}).fpIndexes);
	const ideucltpIndexesGt = groundTruths.map((p, gtIndex) => nonNullIndexes(p).filter(index => !ideuclfnIndexes[gtIndex].includes(index)));
	const ideucltpIndexesPred = predictions.map((p, predIndex) => nonNullIndexes(p).filter(index => !ideuclfpIndexes[predIndex].includes(index)));

	const ideucl = dTravel / trueD;
	const result = {ideucl, match, ideuclfpIndexes, ideuclfnIndexes, ideucltpIndexesPred, ideucltpIndexesGt};
	if (logger) {
		logger.debug('Ideucl details :', result);
	}

	return result;
};
