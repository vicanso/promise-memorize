# promise-memorize [![Build Status](https://travis-ci.org/vicanso/promise-memorize.svg?branch=master)](https://travis-ci.org/vicanso/promise-memorize)

Cache prmoise result for high-performance

## Installation

```bash
$ npm install promise-memorize
``` 

## API

- `hasher` generate cache key, default is use the first parameter for key

- `ttl` cache ttl, default is `0`

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

## License

MIT