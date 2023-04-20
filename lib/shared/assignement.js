const munkres = require('munkres-js');

const squarify = function (mat1, fullfill = 0) {
	let newColIndexes = [];
	let newRowIndexes = [];

	const mat = mat1.concat().map(r => r.concat());
	if (mat.length > mat[0].length) {
		const colstoAdd = mat.length - mat[0].length;
		newColIndexes = new Array(colstoAdd).fill(1).map((_, i) => i + mat[0].length);
		mat.forEach(r => {
			r.push(...(new Array(colstoAdd).fill(fullfill)));
		});
	} else if (mat.length < mat[0].length) {
		const rowsToAdd = mat[0].length - mat.length;
		newRowIndexes = new Array(rowsToAdd).fill(1).map((_, i) => i + mat.length);

		mat.push(...new Array(rowsToAdd).fill(1).map(() => Array.from({length: mat[0].length}).fill(fullfill)));
	}

	return {
		newColIndexes,
		newRowIndexes,
		matrix: mat,
	};
};

module.exports = function (preds0, preds1, {threshold, distFn, mapFn = (o => o), frameIndex}) {
	if (preds0.length === 0 || preds1.length === 0) {
		return {
			unmatched: [preds0.map((_, i) => i), preds1.map((_, i) => i)],
			matched: [],
		};
	}

	const m1 = preds1.map(mapFn);
	const distMatrix = preds0.map(mapFn).map(p0 => m1.map(p1 => distFn(p0, p1, {frameIndex})));

	const {matrix, newColIndexes, newRowIndexes} = squarify(distMatrix);
	const matches = munkres(matrix);

	const matchingTest = ([row, col]) => (!newColIndexes.includes(col) && !newRowIndexes.includes(row) && matrix[row][col] < threshold);

	const matched = matches
		.filter(matchingTest)
		.map(indexes => ({indexes, dist: distMatrix[indexes[0]][indexes[1]]}));

	const unmatched = [[], []];
	matches.filter(o => !matchingTest(o))
		.forEach(([row, col]) => {
			if (!newColIndexes.includes(col)) {
				unmatched[1].push(col);
			}

			if (!newRowIndexes.includes(row)) {
				unmatched[0].push(row);
			}
		});

	return {
		matched: matched.sort((a, b) => a.dist - b.dist),
		unmatched,
	};
};
