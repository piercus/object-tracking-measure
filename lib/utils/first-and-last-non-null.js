const firstNonNull = require('./first-non-null');
const lastNonNull = require('./last-non-null');

module.exports = function (track) {
	const {index: first} = firstNonNull(track);
	const {index: last} = lastNonNull(track);
	return {first, last};
};
