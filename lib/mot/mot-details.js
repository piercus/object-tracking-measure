const defaultDist = require('../shared/iou-distance');
const assignement = require('../shared/assignement');
module.exports = function (options) {
	const {groundTruths, predictions, distFn = defaultDist, threshold = 0.5, mapFn = (o => o), logger} = options;

	const t = groundTruths.map(a => a.filter(a => a).length).reduce((a, b) => a + b, 0);

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
	const fnIndexes = [];
	const fpIndexes = [];
	const allMatched = [];
	const allPhiTIndexes = [];
	let c = 0;
	let dist = 0;

	for (let frameIndex = 0; frameIndex < nFrames; frameIndex++) {
		const objs = [groundTruths, predictions].map(b => b.map((a, index) => ({value: a[frameIndex], index})).filter(a => a.value));

		const values0 = objs[0].map(a => a.value);
		const values1 = objs[1].map(a => a.value);

		const {matched, unmatched} = assignement(
			values0,
			values1,
			{threshold, distFn, mapFn, frameIndex}
		);

		const newCouples = matched.map(({indexes}) => indexes.map((i1, i2) => objs[i2][i1].index));

		const newTrackerToGt = toTrackerToGT(newCouples);
		const phiTIndexes = currentCouples.filter(([gt, pred]) => {
			return ((typeof (newTrackerToGt[pred]) === 'number') && newTrackerToGt[pred] !== gt) ||
				((typeof (newTrackerToGt[pred]) === 'undefined') && (groundTruths[gt][frameIndex] !== null && typeof (groundTruths[gt][frameIndex]) !== 'undefined'));
		}).map(([gt, pred]) => ([pred, gt, newTrackerToGt[pred]]));
		currentCouples = newCouples;
		phi += phiTIndexes.length;
		allPhiTIndexes.push(phiTIndexes);
		fp += unmatched[1].length;
		fn += unmatched[0].length;
		fnIndexes.push(unmatched[1]);
		fpIndexes.push(unmatched[0]);

		allMatched.push(matched.map((m, id) => Object.assign({}, m, {indexes: newCouples[id]})));
		c += matched.length;
		dist += matched.map(({dist}) => dist).reduce((a, b) => a + b, 0);
	}

	const result = {t, fp, fn, phi, c, dist, allMatched, fnIndexes, fpIndexes, allPhiTIndexes};
	if (logger) {
		logger.info('motDetails : ', result);
	}

	return result;
};
