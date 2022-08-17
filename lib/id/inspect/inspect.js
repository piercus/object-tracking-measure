// {idtp: idtp1, idfp, idfn, match, idfnIndexes, idfpIndexes, idtpIndexesGt, idtpIndexesPred}

const drawIdMatch = require('../../shared/draw-id-match');
module.exports = function ({
	idfnIndexes,
	idfpIndexes,
	idtpIndexesGt,
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
			tpIndexes: idtpIndexesGt[gtIndex],
			idfnIndexes: idfnIndexes[gtIndex],
			idfpIndexes: idfpIndexes[predIndex]
		}) + '\n';
	});

	return string;
};
