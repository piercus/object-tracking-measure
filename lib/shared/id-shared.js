const assignement = require('./assignement');
const nonNullIndexes = require('./non-null-indexes');
/**
* List the indexes that are truthy for both
* @param {Array.<Any>} groundTruth
* @param {Array.<Any>} predictions
* @param {Array.<Any>} ops
* @param {object.<Any>} function distance
* @param {object.<Any>} function binaryDistFn
* @returns {Array.<Number>}

*/
/* eslint max-params: ["error", 5] */
/* eslint-env es6 */

const idDetails = function (groundTruths, predictions, options, distFn, binaryDistFn) {
	const vt = groundTruths.map((_, gtIndex) => ({gtIndex})).concat(predictions.map((_, fPredIndex) => ({fPredIndex})));
	const vc = groundTruths.map((_, fGtIndex) => ({fGtIndex})).concat(predictions.map((_, predIndex) => ({predIndex})));
	const {maxCost} = options;

	const {matched, unmatched} = assignement(
		vt,
		vc,
		{
			threshold: maxCost,
			distFn,
		},

	);

	if (unmatched[0].length > 0 || unmatched[1].length > 0) {
		console.log({unmatched, maxCost});
		throw (new Error('ID metrics should not have unmatched assignement'));
	}

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

	const idEucltpSet = matched.filter(({indexes}) => typeof (vt[indexes[0]].gtIndex) === 'number' && typeof (vc[indexes[1]].predIndex) === 'number');

	const match = idEucltpSet.map(({indexes}) => [vt[indexes[0]].gtIndex, vc[indexes[1]].predIndex]);
	const fnIndexes = groundTruths.map((_, gtIndex) => binaryDistFn({gtIndex}, gtMatch[gtIndex]).fnIndexes);
	const fpIndexes = predictions.map((_, predIndex) => binaryDistFn(predMatch[predIndex], {predIndex}).fpIndexes);
	const tpIndexesGt = groundTruths.map((p, gtIndex) => nonNullIndexes(p).filter(index => !fnIndexes[gtIndex].includes(index)));
	const tpIndexesPred = predictions.map((p, predIndex) => nonNullIndexes(p).filter(index => !fpIndexes[predIndex].includes(index)));
	return {match, predMatch, gtMatch, tpPd: tpIndexesPred, tpGT: tpIndexesGt, fpIdx: fpIndexes, fnIdx: fnIndexes};
};

module.exports = {idDetails};
