const nonNullIndexes = require('./non-null-indexes');
const defaultDist = require('./iou-distance');

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

/**
* @callback DistCb
* @param {Any} obj1
* @param {Any} obj2
* @returns {Number}
*/
/**
* @callback MapCb
* @param {Any} detection
* @returns {Any}
*/

/**
* @typedef {Object} DetailedDist
* @property {Number} fp
* @property {Number} fn
*/
/**
* @typedef {Object} TrackDistOptions
* @property {Number} [threshold = 0.5]
* @property {DistCb} [distFn=1 - iou]
* @property {MapCb} [mapFn = (o => o)]
*/

/**
* return the number of unmatching {fp, fn} items
* @param {Array.<Any>} gt
* @param {Array.<Any>} prediction
* @returns {DetailedDist}
*/
const trackDist = function (gt, pred, {distFn = defaultDist, mapFn = (o => o), threshold = 0.5}) {
	const inter = intersection(gt, pred);
	const spatialMatches = inter.filter(index => distFn(mapFn(gt[index]), mapFn(pred[index]), {index}) < threshold);
	const [fn, fp] = [gt, pred].map(b => (b.filter(a => a !== null).length - spatialMatches.length));

	return {
		fp,
		matchIndexes: spatialMatches,
		fpIndexes: nonNullIndexes(pred).filter(index => !spatialMatches.includes(index)),
		fnIndexes: nonNullIndexes(gt).filter(index => !spatialMatches.includes(index)),
		gtL: gt.filter(a => a !== null).length,
		predL: pred.filter(a => a !== null).length,
		fn,
	};
};

/**
* Return the number of unmatching {fp, fn} items
* @param {Array.<Any>} gt
* @param {Array.<Any>} prediction
* @returns {Number}
*/
const trackDistSimple = function (gt, pred, options) {
	const {
		fp,
		fn,
	} = trackDist(gt, pred, options);
	return fp + fn;
};

module.exports = {
	detailed: trackDist,
	simple: trackDistSimple,
};
