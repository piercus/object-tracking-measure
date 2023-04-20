
module.exports = function ({indexesFirst, indexesSecond, getTime}) {
	const a = indexesFirst;
	const b = indexesSecond;

	let ageFn;

	if (getTime) {
		ageFn = function (a, b) {
			return Math.abs(getTime(a) - getTime(b));
		};
	} else {
		ageFn = function (a, b) {
			return Math.abs(a - b);
		};
	}

	if (a.length === 0 || b.length === 0) {
		throw (new Error('arrays should not be empty'));
	}

	const minInit = ageFn(a[0], b[0]);
	const current = {
		indexes: [0, 0],
		min: minInit,
	};
	if (Number.isNaN(minInit)) {
		throw (new TypeError('ageFn returns NaN'));
	}

	while (current.min > 0 && current.indexes[0] < a.length && current.indexes[1] < b.length) {
		const value = ageFn(a[current.indexes[0]], b[current.indexes[1]]);

		if (Number.isNaN(value)) {
			throw (new TypeError('ageFn returns NaN'));
		}

		if (a[current.indexes[0]] < b[current.indexes[1]]) {
			current.indexes[0]++;
		} else {
			current.indexes[1]++;
		}

		if (value < current.min) {
			current.min = value;
		}

		if (value === 0) {
			return value;
		}
	}

	if (current.min < 0) {
		throw (new Error('intersec distanc should not be negative'));
	}

	return current.min;
};
