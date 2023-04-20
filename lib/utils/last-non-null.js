const firstNonNull = require('./first-non-null');

module.exports = function (track) {
	const {value, index} = firstNonNull(track.concat().reverse());
	return {value, index: track.length - 1 - index};
};
