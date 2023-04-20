module.exports = function (value, array, fn) {
	const l = array.length;

	let indexMin = 0;
	let indexMax = l - 1;

	if (fn(array[0]) > value) {
		return null;
	}

	if (fn(array[l - 1]) < value) {
		return null;
	}

	let shouldContinue = true;

	while (indexMin + 1 < indexMax && shouldContinue) {
		const newIndex = Math.floor((indexMin + indexMax) / 2);
		if (fn(array[newIndex]) > value) {
			indexMax = newIndex;
		} else if (fn(array[newIndex]) < value) {
			indexMin = newIndex;
		} else {
			let maxSameIndex = newIndex;
			while (maxSameIndex < l && (fn(array[maxSameIndex]) === value)) {
				maxSameIndex++;
			}

			indexMax = maxSameIndex - 1;

			let minSameIndex = newIndex;
			while (minSameIndex >= 0 && (fn(array[minSameIndex]) === value)) {
				minSameIndex--;
			}

			indexMin = minSameIndex + 1;

			shouldContinue = false;
		}
	}

	if (indexMin === indexMax) {
		return [indexMin];
	}

	const valueBefore = fn(array[indexMin]);
	const valueAfter = fn(array[indexMax]);

	if (valueBefore === value && valueAfter > value) {
		return [indexMin];
	}

	if (valueAfter === value && value > valueBefore) {
		return [indexMax];
	}

	return [indexMin, indexMax];
};
