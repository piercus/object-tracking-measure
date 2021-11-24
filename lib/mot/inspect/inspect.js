const drawMotPreds = require('./draw-mot-preds');

module.exports = function ({
	allMatched,
	nPrediction,
	predNames,
	gtNames,
	columns
}) {
	let string = '';
	for (let i = 0; i < nPrediction; i++) {
		string += drawMotPreds({
			predIndex: i,
			allMatched,
			predName: predNames ? predNames[i] : String(i),
			columns,
			gtNames
		}) + '\n';
	}

	return string;
};
