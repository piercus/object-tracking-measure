// The color package is using os-related nodejs function (process, util, os ...)
// the package is used in the browser
// fake the colors package

const colors = {};
['green', 'red', 'white'].forEach(k => {
	colors[k] = (a => a);
});

module.exports = colors;
