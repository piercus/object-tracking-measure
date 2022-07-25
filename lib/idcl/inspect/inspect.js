// {ideucl, ideuclfpIndexes, ideuclfnIndexes, ideucltpIndexesGt, ideucltpIndexesGt}

const drawIdMatch = require('./draw-ideucl-match');
module.exports = function ({
	ideuclfnIndexes,
	ideuclfpIndexes,
	ideucltpIndexesGt,
	match,
	logger,
	gtNames,
	predNames,
	columns
}) {
	let string = '';

	match.forEach(([gtIndex, predIndex]) => {
		string += drawIdMatch({
			gtIndex,
			predIndex,
			logger,
			columns,
			gtNames,
			predName: predNames && predNames[predIndex],
			tpIndexes: ideucltpIndexesGt[gtIndex],
			ideuclfnIndexes: ideuclfnIndexes[gtIndex],
			ideuclfpIndexes: ideuclfpIndexes[predIndex]
		}) + '\n';
	});

	return string;
};
