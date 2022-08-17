/**
* List the indexes that are truthy for both
* @param {Array.<Any>} first
* @param {Array.<Any>} second
* @returns {Array.<Number>}

*/
const idDetails = function (groundTruths, predictions) {
	const vt = groundTruths.map((_, gtIndex) => ({gtIndex})).concat(predictions.map((_, fPredIndex) => ({fPredIndex})));
	const vc = groundTruths.map((_, fGtIndex) => ({fGtIndex})).concat(predictions.map((_, predIndex) => ({predIndex})));

	return {vt, vc};
};

module.exports = {idDetails};
