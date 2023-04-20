module.exports = array => array
	.map((value, index) => ({value, index}))
	.filter(({value}) => value !== null)
	.map(({index}) => index);

// Return index of element not null [0,2,null,4] ==>[ 0, 1, 3 ]
