module.exports = function ({track, getTime}) {
	const nonNulls = track.map((value, index) => ({value, index})).filter(({value}) => value !== null);

	let iterationAge = track.length;
	let lastIteration = -1;
	let firstIndex = -1;
	let lastIndex = -1;
	let nGaps = 0;
	const currentIteration = track.length - 1;

	if (nonNulls.length > 0) {
		iterationAge = (track.length - 1 - nonNulls[nonNulls.length - 1].index);
		lastIteration = nonNulls[nonNulls.length - 1].index;
		firstIndex = nonNulls[0].index;
		lastIndex = nonNulls[nonNulls.length - 1].index;
		nonNulls.slice(1).forEach(({index}, nNIndex) => {
			if (index !== nonNulls[nNIndex].index + 1) {
				nGaps++;
			}
		});
	}

	const age = getTime ? getTime(currentIteration) - getTime(lastIteration) : currentIteration - lastIteration;

	const result = {
		count: nonNulls.length,
		age,
		iterationAge,
		fullDensity: nonNulls.length / track.length,
		gapDensity: nonNulls.length === 0 ? 0 : nGaps / nonNulls.length,
		density: nonNulls.length / (lastIndex + 1 - firstIndex),
		firstIndex,
		lastIndex,
	};

	return result;
};
