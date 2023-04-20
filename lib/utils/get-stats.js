module.exports = function ({track, getTime}) {
	const nonNulls = track.map((value, index) => ({value, index})).filter(({value}) => value !== null);

	if (nonNulls.length === 0) {
		throw (new Error('corrupted track doesnot contains any value'));
	}

	const iterationAge = (track.length - 1 - nonNulls[nonNulls.length - 1].index);
	const currentIteration = track.length - 1;
	const lastIteration = nonNulls[nonNulls.length - 1].index;
	const firstIndex = nonNulls[0].index;
	const lastIndex = nonNulls[nonNulls.length - 1].index;
	let nGaps = 0;
	nonNulls.slice(1).forEach(({index}, nNIndex) => {
		if (index !== nonNulls[nNIndex].index + 1) {
			nGaps++;
		}
	});
	let age;

	if (getTime) {
		age = getTime(currentIteration) - getTime(lastIteration);
	} else {
		age = currentIteration - lastIteration;
	}

	const result = {
		count: nonNulls.length,
		age,
		iterationAge,
		fullDensity: nonNulls.length / track.length,
		gapDensity: nGaps / nonNulls.length,
		density: nonNulls.length / (lastIndex + 1 - firstIndex),
		firstIndex,
		lastIndex: nonNulls[nonNulls.length - 1].index
	};

	return result;
};
