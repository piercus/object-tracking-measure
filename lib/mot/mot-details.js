const defaultDist = require('../shared/iou-distance');
const assignement = require('../shared/assignement');
module.exports = function (options) {
	const {groundTruths, predictions, distFn = defaultDist, threshold = 1, mapFn = (o => o), logger} = options;

	const t = groundTruths.map(a => a.filter(a => a).length).reduce((a, b) => a + b);

	const all = groundTruths.concat(predictions);
	const nFrames = Math.max(...all.map(a => a.length));

	let currentCouples = [];
	const toTrackerToGT = function (couples) {
		const result = {};
		couples.forEach(([gt, pred]) => {
			result[pred] = gt;
		});
		return result;
	};

	let phi = 0;
	let fn = 0;
	let fp = 0;
	let c = 0;
	let dist = 0;

	for (let frameIndex = 0; frameIndex < nFrames; frameIndex++) {
		const objs = [groundTruths, predictions].map(b => b.map((a, index) => ({value: a[frameIndex], index})).filter(a => a.value));

		const {matched, unmatched} = assignement(
			objs[0].map(a => a.value),
			objs[1].map(a => a.value),
			{threshold, distFn, mapFn}
		);

		const newCouples = matched.map(({indexes}) => indexes.map((i1, i2) => objs[i2][i1].index));

		const newTrackerToGt = toTrackerToGT(newCouples);
		const phiT = currentCouples.filter(([gt, pred]) => newTrackerToGt[pred] !== gt).length;
		currentCouples = newCouples;
		phi += phiT;
		fp += unmatched[1].length;
		fn += unmatched[0].length;
		c += matched.length;
		dist += matched.map(({dist}) => dist).reduce((a, b) => a + b, 0);
	}

	const result = {t, fp, fn, phi, c, dist};
	if (logger) {
		logger.info('motDetails : ', result);
	}

	return result;
};
