const colors = require('colors');

module.exports = function ({
	s,
	previousS,
	str
}) {
	if (s.char === previousS.char) {
		return str + colors[s.color]('\u2015');
	}

	let string2;
	if (previousS.char.length > 0) {
		string2 = str.slice(0, Math.max(0, str.length - colors[previousS.color](previousS.char).length)) + colors[previousS.color](previousS.char);
	} else {
		string2 = str;
	}

	return string2 + colors[s.color](s.char);
};
