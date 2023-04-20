module.exports = function (a, b) {
	const intersec = [];
	const a2 = [];
	const b2 = b.concat();
	a.forEach(o => {
		const index = b2.indexOf(o);
		if (index === -1) {
			a2.push(o);
		} else {
			intersec.push(o);
			b2.splice(index, 1);
		}
	});

	return {
		intersec,
		nonIntersec: [a2, b2]
	};
};
