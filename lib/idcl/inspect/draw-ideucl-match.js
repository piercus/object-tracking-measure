const updateString = require('../../shared/update-string');
const colors = require('colors');

module.exports = function ({
	gtIndex,
	gtNames,
	predName,
	predIndex,
	tpIndexes,
	ideuclfnIndexes,
	ideuclfpIndexes,
	columns
}) {
	const max = Math.max(...tpIndexes.concat(ideuclfnIndexes).concat(ideuclfpIndexes));
	const checkmark = {
		color: 'green',
		char: '\u2713'
	};
	const crossmark = {
		color: 'red',
		char: '\u2717'
	};
	const nomark = {
		color: 'white',
		char: '?'
	};
	let gtName;
	if (!gtNames || typeof (gtNames[gtIndex]) !== 'string') {
		gtName = 'GroundTruth';
	} else {
		gtName = gtNames[gtIndex];
	}

	if (typeof (predName) !== 'string') {
		predName = 'Prediction';
	}

	let stringGt = `${gtName}[${gtIndex}]`;
	let stringPred = `${predName}[${predIndex}]`;
	const stringMax = Math.max(stringGt.length, stringPred.length);

	const size = columns - stringMax;
	const maxDistPreviousScale = 5;
	const scale = 1;

	stringGt += ' '.repeat(stringMax - stringGt.length);
	stringPred += ' '.repeat(stringMax - stringPred.length);
	let abscisses = ' '.repeat(stringMax);
	let abscissesTips = ' '.repeat(stringMax);
	let distToPreviousScale = 100;
	let lastIndexScale;
	let previousSGt = {char: ''};
	let previousSPred = {char: ''};
	for (let i = 0; i < size; i++) {
		const index = Math.floor(i / size * max);
		let sGt = nomark;
		let sPred = nomark;
		if (tpIndexes.includes(index)) {
			sGt = checkmark;
			sPred = checkmark;
		} else {
			if (ideuclfnIndexes.includes(index)) {
				sGt = crossmark;
			}

			if (ideuclfpIndexes.includes(index)) {
				sPred = crossmark;
			}
		}

		stringPred = updateString({
			s: sPred,
			previousS: previousSPred,
			str: stringPred
		});
		previousSPred = sPred;
		stringGt = updateString({
			s: sGt,
			previousS: previousSGt,
			str: stringGt
		});
		previousSGt = sGt;

		if (index % scale === 0 && distToPreviousScale > maxDistPreviousScale && lastIndexScale !== index) {
			abscisses += '|';
			abscissesTips += index;
			distToPreviousScale = -1 * (index.toString().length - 1);
			lastIndexScale = index;
		} else {
			abscisses += '-';
			if (distToPreviousScale >= 0) {
				abscissesTips += ' ';
			}

			distToPreviousScale++;
		}
	}

	if (previousSGt.char.length > 0) {
		stringGt = stringGt.slice(0, Math.max(0, stringGt.length - colors[previousSGt.color](previousSGt.char).length)) + colors[previousSGt.color](previousSGt.char);
	}

	if (previousSPred.char.length > 0) {
		stringPred = stringPred.slice(0, Math.max(0, stringPred.length - colors[previousSPred.color](previousSPred.char).length)) + colors[previousSPred.color](previousSPred.char);
	}

	const string = '--\n' +
							`${stringGt}\n` +
							`${stringPred}\n` +
							`${abscisses}\n` +
							`${abscissesTips}\n`;

	return string;
};
