const fastSortedSeach = require('./fast-sorted-search');
const allNonNull = require('./all-non-null');

module.exports = function ({track, iteration}) {
	if (track[iteration] !== null) {
		throw (new Error('not a null segment'));
	}

	const allNonNullIndexes = allNonNull({track});
	const sortedIndexes = fastSortedSeach(iteration, allNonNullIndexes, (i => i));
	if (sortedIndexes === null) {
		if (iteration < allNonNullIndexes[0]) {
			return {first: 0, last: allNonNullIndexes[0] - 1, type: 'null'};
		}

		return {first: allNonNullIndexes[allNonNullIndexes.length - 1] + 1, last: track.length - 1, type: 'null'};
	}

	const [firstIndex, lastIndex] = sortedIndexes;
	return {first: allNonNullIndexes[firstIndex] + 1, last: allNonNullIndexes[lastIndex], type: 'null'};
};
