module.exports = function ({track, start, end}) {
	if (typeof (end) !== 'number') {
		end = track.length - 1;
	}

	if (typeof (start) !== 'number') {
		start = 0;
	}

	const indexes = [];
	for (let j = start; j <= end; j++) {
		if (track[j] !== null) {
			indexes.push(j);
		}
	}

	return indexes;
};
