const idDetails = require('./ideucl-details');

module.exports = function (options) {
	const details = idDetails(options);
	const {idEucl} = details;
	return idEucl;
};
