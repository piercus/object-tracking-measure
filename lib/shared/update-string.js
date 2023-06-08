const colors = require('./colors');

module.exports = function ({
	s,
	previousS,
	str,
}) {
	if (s.char === previousS.char) {
		return str + colors[s.color]('\u2015');
	}

	const string2 = previousS.char.length > 0 ? str.slice(0, Math.max(0, str.length - colors[previousS.color](previousS.char).length)) + colors[previousS.color](previousS.char) : str;

	return string2 + colors[s.color](s.char);
};
