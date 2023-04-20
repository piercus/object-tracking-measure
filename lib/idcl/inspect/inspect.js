// {ideucl, ideuclfpIndexes, ideuclfnIndexes, ideucltpIndexesGt, ideucltpIndexesGt}

const drawIdMatch = require('../../shared/draw-id-match');

module.exports = function ({
	idEuclfnIndexes,
	idEuclfpIndexes,
	idEucltpIndexesGt,
	match,
	logger,
	gtNames,
	predNames,
	columns,
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
			tpIndexes: idEucltpIndexesGt[gtIndex],
			idfnIndexes: idEuclfnIndexes[gtIndex],
			idfpIndexes: idEuclfpIndexes[predIndex],
		}) + '\n';
	});

	return string;
};
