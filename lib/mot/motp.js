const motDetails = require('./mot-details');

module.exports = function (options) {
	const {c, dist} = motDetails(options);
	return dist / c;
};
