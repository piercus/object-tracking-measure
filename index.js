module.exports = Object.assign({
	mota: require('./lib/mot/mota'),
	motp: require('./lib/mot/motp'),
	motDetails: require('./lib/mot/mot-details'),
	idDetails: require('./lib/id/id-details'),
	idTrackDist: require('./lib/id/track-dist'),
	idf1: require('./lib/id/idf1'),
	idInspect: require('./lib/id/inspect/inspect.js'),
	motInspect: require('./lib/mot/inspect/inspect.js'),
	getStats: require('./lib/utils/get-stats.js')
}, require('./lib/utils'));
