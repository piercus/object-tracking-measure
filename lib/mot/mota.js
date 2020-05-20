const motDetails = require('./mot-details');

module.exports = function (options) {
	const {fn, fp, phi, t} = motDetails(options);
	return 1 - ((fn + fp + phi) / t);
};
