# promise-memorize 

[![Build Status](https://travis-ci.org/vicanso/promise-memorize.svg?style=flat-square)](https://travis-ci.org/vicanso/promise-memorize)
[![Coverage Status](https://img.shields.io/coveralls/vicanso/promise-memorize/master.svg?style=flat)](https://coveralls.io/r/vicanso/promise-memorize?branch=master)
[![npm](http://img.shields.io/npm/v/promise-memorize.svg?style=flat-square)](https://www.npmjs.org/package/promise-memorize)
[![Github Releases](https://img.shields.io/npm/dm/promise-memorize.svg?style=flat-square)](https://github.com/vicanso/promise-memorize)

Cache prmoise result for high-performance

## Examples

View the [./examples](examples) directory for working examples. 

## Installation

```bash
$ npm install promise-memorize
``` 

## API

### memorize

- `hasher` generate cache key, default is use the first parameter for key

- `ttl` cache ttl, default is `0`

return a new function for cache call, the function extends EventEmitter.



Cache promise for parallel call

```js
const memorize = require('promise-memorize');
const getProduct = (id) => {
  return new Promise((resolve, reject) => {
    // get product by id
  });
};
// the parallel call will use the same promise
const cacheGetProduct = memorize(getProduct);

// call 1 and call 2 use the same promise
// call 1
cacheGetProduct('Nike').then((data) => {
  // call 3
  cacheGetProduct('Nike').then((data) => {
  });
});
// call 2
cacheGetProduct('Nike').then((data) => {
  
});
```

Cache promise with ttle

```js
const memorize = require('promise-memorize');
const getProduct = (id) => {
  return new Promise((resolve, reject) => {
    // get product by id
  });
};
// cache result for 10 s
const cacheGetProduct = memorize(getProduct, 10 * 1000);
// call 1, call 2 and call 3 use the same promise
// call 1
cacheGetProduct('Nike').then((data) => {
  // call 3
  cacheGetProduct('Nike').then((data) => {
  });
});
// call 2
cacheGetProduct('Nike').then((data) => {
  
});
```

Cache promise with hasher and ttl


```js
const memorize = require('promise-memorize');
const getProducts = (category, type) => {
  return new Promise((resolve, reject) => {
    // get product by category and type
  });
};
const cacheGetProducts = memorize(getProduct, (category, type) => {
  return `${category}-${type}`;
},10 * 1000);
// call 1 and call 2 use the same promise

// call 1
cacheGetProducts('My-Category', 'My-Type').then((products) => {
  
});
// call 2
cacheGetProducts('My-Category', 'My-Type').then((products) => {
  
});
// call 3, not the same prmoise as call 1
cacheGetProducts('My-Category', 'My-A-Type').then((products) => {
  
});
```

### memorize.unmemorized

get original function

```js
const memorize = require('promise-memorize');
const get = function() {
  // .....
};
const cacheGet = memorize(get);
// cacheGet.unmemorized === get
```

### delete

- `key` delete cache promise

```js
const memorize = require('promise-memorize');
const get = function() {
  // .....
};
const cacheGet = memorize(get, 10 * 1000);
cacheGet('vicanso').then((data) => {
  // after get the data, the remove the promise from cache
  cacheGet.delete('vicanso');
});
```

### clear

```js
const memorize = require('promise-memorize');
const get = function() {
  // .....
};
const cacheGet = memorize(get, 10 * 1000);
cacheGet('vicanso').then((data) => {
  // after get the data, the clear all the promise from cache
  cacheGet.clear();
});
```

### size

```js
const memorize = require('promise-memorize');
const get = function() {
  // .....
};
const cacheGet = memorize(get, 10 * 1000);
cacheGet('vicanso').then((data) => {
  // size is 1
  cacheGet.size();
});
```
### periodicClear

Set interval to check whether the promise is expired in order to avoid memory leak 

- `interval` chcek interval

```js
const memorize = require('promise-memorize');
const get = function() {
  // .....
};
const cacheGet = memorize(get, 10 * 1000);
cacheGet.periodicClear(10 * 1000);
cacheGet('vicanso').then((data) => {
  // size is 1
  cacheGet.size();
});
```

### events

Adds the listener function to the end of the listeners array for the event named eventName. 

- `eventName` The name of the event

- `listener` The callback function


```js
const memorize = require('promise-memorize');
const get = function() {
  // .....
};
const cacheGet = memorize(get, 10 * 1000);
cacheGet.on('add', key => {
  console.info(key);
});
cacheGet.on('delete', key => {
  console.info(key);
});
cacheGet.on('resolve', key => {
  console.info(key);
});
cacheGet.on('reject', key => {
  console.info(key);
});
cacheGet('vicanso').then((data) => {
  // size is 1
  cacheGet.size();
});
```

## License

MIT