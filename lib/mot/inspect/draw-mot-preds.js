
module.exports = function ({
	predIndex,
	strMax: stringMax = 20,
	columns,
	allMatched,
	gtNames,
	predName,
}) {
	const max = allMatched.length;
	if (typeof (predName) !== 'string') {
		predName = 'Prediction';
	}

	const size = columns - stringMax;
	let string = `${predName}[${predIndex}]`;
	let distToPreviousScale = 1;
	string += ' '.repeat(stringMax - string.length);
	for (let charIndex = 0; charIndex < size; charIndex++) {
		const frameIndex = Math.floor(charIndex / size * max);
		const match = allMatched[frameIndex].find(a => a.indexes[1] === predIndex);

		if (match && distToPreviousScale >= 1) {
			const string_ = gtNames && gtNames[match.indexes[0]] ? gtNames[match.indexes[0]] : match.indexes[0];

			string += string_;
			distToPreviousScale = -1 * (string_.toString().length - 1);
		} else {
			if (distToPreviousScale >= 0) {
				string += '-';
			}

			distToPreviousScale++;
		}
	}

	return string;
};
