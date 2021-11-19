module.exports = array => {
	return array
		.map((value, index) => ({value, index}))
		.filter(({value}) => value !== null)
		.map(({index}) => index);
};
