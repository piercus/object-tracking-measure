const idDetails = require('./ideucl-details');

module.exports = function (options) {
	const details = idDetails(options);
	const {ideucl} = details;
	return ideucl;
};
