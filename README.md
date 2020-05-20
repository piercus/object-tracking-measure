## Object Tracking measure

This project aims to calculate metrics for tracking algorithm

### MOTA

See [[1]](#1).

```
const otm = require('object-tracking-measure');

const groundTruths = [
	[
		[22, 33, 20, 20],// x, y, w, h
		[22, 33, 20, 20],
		[22, 33, 20, 20],
		[22, 33, 20, 20]
	],
	[
		[22, 33, 20, 20],// x, y, w, h
		null,
		[25, 35, 20, 20],
		[39, 41, 20, 20]
	]
];

const predictions = [
	[
		[23, 33, 22, 20],// x, y, w, h
		[21, 35, 20, 26],
		[23, 33, 22, 20],
		[21, 35, 20, 26]
	],
	[
		[23, 33, 20, 20],// x, y, w, h
		null,
		[23, 35, 22, 20],
		[39, 35, 20, 26]
	]
];

otm.mota({
	groundTruths,
	predictions
});
```

### IDF1

See [[2]](#2).

```
const otm = require('object-tracking-measure');

const groundTruths = [
	[
		[22, 33, 20, 20],// x, y, w, h
		[22, 33, 20, 20],
		[22, 33, 20, 20],
		[22, 33, 20, 20]
	],
	[
		[22, 33, 20, 20],// x, y, w, h
		null,
		[25, 35, 20, 20],
		[39, 41, 20, 20]
	]
];

const predictions = [
	[
		[23, 33, 22, 20],// x, y, w, h
		[21, 35, 20, 26],
		[23, 33, 22, 20],
		[21, 35, 20, 26]
	],
	[
		[23, 33, 20, 20],// x, y, w, h
		null,
		[23, 35, 22, 20],
		[39, 35, 20, 26]
	]
];

otm.idf1({
	groundTruths,
	predictions
});
```

## References
<a id="1">[1]</a> 
Keni Bernardin and Rainer Stiefelhagen (2008). 
(Evaluating Multiple Object Tracking Performance: The CLEAR MOT Metrics)[https://link.springer.com/content/pdf/10.1155/2008/246309.pdf]

<a id="2">[2]</a> 
Ergys Ristani1, Francesco Solera2, Roger S. Zou1, Rita Cucchiara2, and Carlo Tomasi1 (2016). 
(Performance Measures and a Data Set for Multi-Target, Multi-Camera Tracking)[https://arxiv.org/pdf/1609.01775.pdf]