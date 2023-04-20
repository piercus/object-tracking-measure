[![Build Status](https://travis-ci.org/piercus/object-tracking-measure.svg?branch=master)](https://travis-ci.org/piercus/object-tracking-measure)

## Object Tracking measure

This project aims to calculate metrics for tracking algorithm (especially MOTA, IDF1)

### MOTA

See [[1]](#1).

```js
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

```js
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

### Advanced usage

By default, object-tracking-measure uses 
* distance between boxes is (1 - Intersection Over Union) (using [mean-average-precision](https://www.npmjs.com/package/mean-average-precision) library)
* threshold is 1 (i.e. IOU = 0  - no overlap)

You can cutomize this, for example to track distance between {x,y} points like

```js
const otm = require('object-tracking-measure');

const groundTruths = [
	[
		{x: 22, y: 34},
		{x: 22, y: 34},
		{x: 22, y: 34},
		{x: 22, y: 34}
	],
	[
		{x: 55, y: 68},// x, y, w, h
		null,
		{x: 55, y: 68},
		{x: 55, y: 68}
	]
];

const predictions = [
	[
		{x: 22, y: 34},// x, y, w, h
		{x: 22, y: 34},
		{x: 22, y: 34},
		{x: 22, y: 34}
	],
	[
		{x: 55, y: 68},// x, y, w, h
		null,
		{x: 55, y: 68},
		{x: 55, y: 68}
	]
];

otm.idf1({
	groundTruths,
	predictions,
	distFn: ((a,b) => Math.sqrt(((a.x - b.x) * (a.x - b.x)) + ((a.y - b.y) * (a.y - b.y)))), // Euclidian distance
	threshold: 2 // means that 2 meters far is too far
});
```
## Inspect ID Metric
```js
const measure = otm.idDetails({
	groundTruths,
	predictions
});

console.log(otm.idInspect(Object.assign({}, measure, {
	columns: process.stdout.columns - 20
})))
```
will print
```bash
--
GroundTruth[0]✓――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――✓
Prediction[0] ✓――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――✓
              |----------------------------|----------------------------|---------------------------
              0                            1                            2                           

--
GroundTruth[1]✓―――――――――――――――――――――――――――✓?―――――――――――――――――――――――――――?✓――――――――――――――――――――――――――✓
Prediction[1] ✓―――――――――――――――――――――――――――✓?―――――――――――――――――――――――――――?✓――――――――――――――――――――――――――✓
              |----------------------------|----------------------------|---------------------------
```
## Inspect MOT Metric
```js
const measure = otm.motDetails({
	groundTruths,
	predictions
});

console.log(otm.motInspect(Object.assign({}, measure, {
	columns: process.stdout.columns - 20
})))
```
will print
```bash
0[0]                1-1-1-1-1-1-1-1-1-1-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-0-
1[1]                0-0-0-0-0-0-0-0-0-0---------------------1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-
```

## Other tools

### getStats

```js
const result = otm.getStats({
	track: [
		[22, 33, 20, 20], // X, y, w, h
		null,
		[25, 35, 20, 20],
		[39, 41, 20, 20],
		null
	]
});

/* 
{
	count: 3, // number of non-null point)
	iterationAge: 1, // number of null at the end
	fullDensity: 0.6, // non-null /total size of track
	gapDensity: 0.3333333333333333, // number of gaps / number of non-null
	density: 0.75, // non-null / size of the trimed track
	firstIndex: 0, // first index of the trimed track
	lastIndex: 3 // last index of the trimed track
}
*/
 
```

### fastGetNullSegment

```js
const result = otm.fastGetNullSegment({
	track: [
		[22, 33, 20, 20], // X, y, w, h
		null,
		null,
		null,
		[25, 35, 20, 20],
		[39, 41, 20, 20],
		null
	]
});

/* 
{
	first: 1,
	last: 5,
	type: 'null',
}
*/
 
```
## References
<a id="1">[1]</a> 
Keni Bernardin and Rainer Stiefelhagen (2008). 
[Evaluating Multiple Object Tracking Performance: The CLEAR MOT Metrics](https://link.springer.com/content/pdf/10.1155/2008/246309.pdf)

<a id="2">[2]</a> 
Ergys Ristani1, Francesco Solera2, Roger S. Zou1, Rita Cucchiara2, and Carlo Tomasi1 (2016). 
[Performance Measures and a Data Set for Multi-Target, Multi-Camera Tracking](https://arxiv.org/pdf/1609.01775.pdf)
