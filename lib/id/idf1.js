const idDetails = require('./id-details');

module.exports = function (options) {
	const details = idDetails(options);
	const {idtp, idfp, idfn} = details;

	return (2 * idtp) / ((2 * idtp) + idfp + idfn);
};
