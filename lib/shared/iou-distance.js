const mAP = require('mean-average-precision');

const toFormat = function (o) {
	if (typeof (o[0]) !== 'number' || typeof (o[2]) !== 'number') {
		throw (new TypeError('left and right should be defined'));
	}

	return {
		left: o[0],
		top: o[1],
		right: o[0] + o[2],
		bottom: o[1] + o[3],
	};
};

module.exports = ((a, b) => 1 - mAP.iou(toFormat(a), toFormat(b)));
