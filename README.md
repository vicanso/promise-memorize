# promise-memorize 

[![Build Status](https://travis-ci.org/vicanso/promise-memorize.svg?style=flat-square)](https://travis-ci.org/vicanso/promise-memorize)
[![Coverage Status](https://img.shields.io/coveralls/vicanso/promise-memorize/master.svg?style=flat)](https://coveralls.io/r/vicanso/promise-memorize?branch=master)
[![npm](http://img.shields.io/npm/v/promise-memorize.svg?style=flat-square)](https://www.npmjs.org/package/promise-memorize)
[![Github Releases](https://img.shields.io/npm/dm/promise-memorize.svg?style=flat-square)](https://github.com/vicanso/promise-memorize)

Cache promise result for high-performance

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
const fs = require('fs');
const path = require('path');
const readFile = function(file, encoding) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, encoding, (err, data) => {
      console.info(`get file:${file} encoding:${encoding}`);
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

const readFileMemo = memorize(readFile);
const file = path.join(__dirname, './fs.js');
readFileMemo(file).then(buf => {
  console.info(`buf size:${buf.length}`);
});
readFileMemo(file).then(buf => {
  console.info(`buf size:${buf.length}`);
  readFileMemo(file).then(buf => {
    console.info(`buf size:${buf.length}`);
  });
});
```

```log
[info] 2016-05-26T14:39:52.663Z get file:/promise-memorize/examples/fs.js encoding:undefined
[info] 2016-05-26T14:39:52.666Z buf size:818
[info] 2016-05-26T14:39:52.667Z buf size:818
[info] 2016-05-26T14:39:52.668Z get file:/promise-memorize/examples/fs.js encoding:undefined
[info] 2016-05-26T14:39:52.668Z buf size:818
```

Cache promise with ttl

```js
const memorize = require('promise-memorize');
const fs = require('fs');
const path = require('path');
const readFile = function(file, encoding) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, encoding, (err, data) => {
      console.info(`get file:${file} encoding:${encoding}`);
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

const readFileMemo = memorize(readFile, 10 * 1000);
const file = path.join(__dirname, './fs.js');
readFileMemo(file).then(buf => {
  console.info(`buf size:${buf.length}`);
});
readFileMemo(file).then(buf => {
  console.info(`buf size:${buf.length}`);
  readFileMemo(file).then(buf => {
    console.info(`buf size:${buf.length}`);
  });
});
```

```log
[info] 2016-05-26T14:40:16.117Z get file:/promise-memorize/examples/fs.js encoding:undefined
[info] 2016-05-26T14:40:16.121Z buf size:829
[info] 2016-05-26T14:40:16.122Z buf size:829
[info] 2016-05-26T14:40:16.123Z buf size:829
```

Cache promise with hasher and ttl


```js
const memorize = require('promise-memorize');
const fs = require('fs');
const path = require('path');
const readFile = function(file, encoding) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, encoding, (err, data) => {
      console.info(`get file:${file} encoding:${encoding}`);
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

const readFileMemo = memorize(readFile, (file, encoding) => {
  return `${file}-${encoding}`;
}, 10 * 1000);
const file = path.join(__dirname, './fs.js');
readFileMemo(file, 'utf8').then(buf => {
  console.info(`buf size:${buf.length}`);
});
readFileMemo(file, 'ascii').then(buf => {
  console.info(`buf size:${buf.length}`);
  readFileMemo(file, 'ascii').then(buf => {
    console.info(`buf size:${buf.length}`);
  });
});
```

```log
[info] 2016-05-26T14:40:39.429Z get file:/promise-memorize/examples/fs.js encoding:utf8
[info] 2016-05-26T14:40:39.432Z buf size:912
[info] 2016-05-26T14:40:39.433Z get file:/promise-memorize/examples/fs.js encoding:ascii
[info] 2016-05-26T14:40:39.433Z buf size:912
[info] 2016-05-26T14:40:39.433Z buf size:912
```


### memorize.unmemorized

get original function

```js
const memorize = require('promise-memorize');
const fs = require('fs');
const path = require('path');
const readFile = function(file, encoding) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, encoding, (err, data) => {
      console.info(`get file:${file} encoding:${encoding}`);
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

const readFileMemo = memorize(readFile, 10 * 1000);
const file = path.join(__dirname, './fs.js');
console.info(readFileMemo.unmemorized === readFile);
readFileMemo.unmemorized(file).then(buf => {
  console.info(`buf size:${buf.length}`);
});
readFileMemo.unmemorized(file).then(buf => {
  console.info(`buf size:${buf.length}`);
});
```

```log
[info] 2016-05-26T14:41:22.741Z true
[info] 2016-05-26T14:41:22.746Z get file:/promise-memorize/examples/fs.js encoding:undefined
[info] 2016-05-26T14:41:22.748Z buf size:821
[info] 2016-05-26T14:41:22.748Z get file:/promise-memorize/examples/fs.js encoding:undefined
[info] 2016-05-26T14:41:22.748Z buf size:821
```

### delete

- `key` delete cache promise

```js
const memorize = require('promise-memorize');
const fs = require('fs');
const path = require('path');
const readFile = function(file, encoding) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, encoding, (err, data) => {
      console.info(`get file:${file} encoding:${encoding}`);
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

const readFileMemo = memorize(readFile, 10 * 1000);
const file = path.join(__dirname, './fs.js');

readFileMemo(file).then(buf => {
  console.info(`buf size:${buf.length}`);
  readFileMemo.delete(file);
  return readFileMemo(file);
}).then(buf => {
  console.info(`buf size:${buf.length}`);
});
```

```log
[info] 2016-05-26T14:41:41.459Z get file:/promise-memorize/examples/fs.js encoding:undefined
[info] 2016-05-26T14:41:41.461Z buf size:783
[info] 2016-05-26T14:41:41.463Z get file:/promise-memorize/examples/fs.js encoding:undefined
[info] 2016-05-26T14:41:41.463Z buf size:783
```

### clear

```js
const memorize = require('promise-memorize');
const fs = require('fs');
const path = require('path');
const readFile = function(file, encoding) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, encoding, (err, data) => {
      console.info(`get file:${file} encoding:${encoding}`);
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

const readFileMemo = memorize(readFile, 10 * 1000);
const file = path.join(__dirname, './fs.js');

readFileMemo(file).then(buf => {
  console.info(`buf size:${buf.length}`);
  readFileMemo.clear();
  return readFileMemo(file);
}).then(buf => {
  console.info(`buf size:${buf.length}`);
});
```

```log
[info] 2016-05-26T14:41:59.607Z get file:/promise-memorize/examples/fs.js encoding:undefined
[info] 2016-05-26T14:41:59.610Z buf size:778
[info] 2016-05-26T14:41:59.612Z get file:/promise-memorize/examples/fs.js encoding:undefined
[info] 2016-05-26T14:41:59.612Z buf size:778
```

### size

```js
const memorize = require('promise-memorize');
const fs = require('fs');
const path = require('path');
const readFile = function(file, encoding) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, encoding, (err, data) => {
      console.info(`get file:${file} encoding:${encoding}`);
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

const readFileMemo = memorize(readFile, 10 * 1000);
const file = path.join(__dirname, './fs.js');

readFileMemo(file).then(buf => {
  console.info(`buf size:${buf.length}`);
  console.info(`memorize size:${readFileMemo.size()}`);
});
```

```log
[info] 2016-05-26T14:42:16.935Z get file:/promise-memorize/examples/fs.js encoding:undefined
[info] 2016-05-26T14:42:16.937Z buf size:722
[info] 2016-05-26T14:42:16.938Z memorize size:1
```

### periodicClear

Set interval to check whether the promise is expired in order to avoid memory leak 

- `interval` chcek interval

```js
const memorize = require('promise-memorize');
const fs = require('fs');
const path = require('path');
const readFile = function(file, encoding) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, encoding, (err, data) => {
      console.info(`get file:${file} encoding:${encoding}`);
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

const readFileMemo = memorize(readFile, 10 * 1000);
const file = path.join(__dirname, './fs.js');

readFileMemo.periodicClear(1 * 1000);
readFileMemo(file).then(buf => {
  console.info(`buf size:${buf.length}`);
  console.info(`memorize size:${readFileMemo.size()}`);
});

setTimeout(() => {
  console.info(`memorize size:${readFileMemo.size()}`);
}, 12 * 1000);
```

```log
[info] 2016-05-26T14:42:32.977Z get file:/promise-memorize/examples/fs.js encoding:undefined
[info] 2016-05-26T14:42:32.979Z buf size:851
[info] 2016-05-26T14:42:32.980Z memorize size:1
[info] 2016-05-26T14:42:44.981Z memorize size:0
```

### events

Adds the listener function to the end of the listeners array for the event named eventName. 

- `eventName` The name of the event

- `listener` The callback function


```js
const memorize = require('promise-memorize');
const fs = require('fs');
const path = require('path');
const readFile = function(file, encoding) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, encoding, (err, data) => {
      console.info(`get file:${file} encoding:${encoding}`);
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

const readFileMemo = memorize(readFile, 10 * 1000);
const file = path.join(__dirname, './fs.js');

readFileMemo.on('add', key => {
  console.info(`add:${key}`);
});
readFileMemo.on('delete', key => {
  console.info(`delete:${key}`);
});
readFileMemo.on('resolve', key => {
  console.info(`resolve:${key}`);
});
readFileMemo.on('reject', key => {
  console.info(`reject:${key}`);
});

readFileMemo(file).then(buf => {
  console.info(`buf size:${buf.length}`);
  readFileMemo.delete(file);
  readFileMemo('a.js');
});
```

```log
[info] 2016-05-26T14:43:02.699Z add:/promise-memorize/examples/fs.js
[info] 2016-05-26T14:43:02.703Z get file:/promise-memorize/examples/fs.js encoding:undefined
[info] 2016-05-26T14:43:02.705Z resolve:/promise-memorize/examples/fs.js
[info] 2016-05-26T14:43:02.705Z buf size:1004
[info] 2016-05-26T14:43:02.705Z delete:/promise-memorize/examples/fs.js
[info] 2016-05-26T14:43:02.706Z add:a.js
[info] 2016-05-26T14:43:02.706Z get file:a.js encoding:undefined
[info] 2016-05-26T14:43:02.707Z reject:a.js
```

## License

MIT
