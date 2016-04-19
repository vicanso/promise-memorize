# promise-memorize [![Build Status](https://travis-ci.org/vicanso/promise-memorize.svg?branch=master)](https://travis-ci.org/vicanso/promise-memorize)

Cache prmoise result for high-performance

## Examples

View the [./examples](examples) directory for working examples. 

## Installation

```bash
$ npm install promise-memorize
``` 

## API

- `hasher` generate cache key, default is use the first parameter for key

- `ttl` cache ttl, default is `0`

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

## License

MIT