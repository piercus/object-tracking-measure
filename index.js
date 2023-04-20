module.exports = Object.assign({
	mota: require('./lib/mot/mota'),
	motp: require('./lib/mot/motp'),
	motDetails: require('./lib/mot/mot-details'),
	idDetails: require('./lib/id/id-details'),
	idTrackDist: require('./lib/shared/track-dist'),
	idf1: require('./lib/id/idf1'),
	idInspect: require('./lib/id/inspect/inspect.js'),
	motInspect: require('./lib/mot/inspect/inspect.js'),
	idEucl: require('./lib/idcl/ideucl'),
	idEuclDetails: require('./lib/idcl/ideucl-details'),
	idEuclInspect: require('./lib/idcl/inspect/inspect.js')
}, require('./lib/utils'));