module.exports = function (track) {
	for (let j = 0; j <= track.length; j++) {
		if (track[j] !== null) {
			return {index: j, value: track[j]};
		}
	}

	throw (new Error('null track'));
};
