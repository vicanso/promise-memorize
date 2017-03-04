'use strict';

const EventEmitter = require('events');

const periodicClearList = [];

function globalPeriodicClear() {
  periodicClearList.forEach(fn => fn());
}

function removeFromGlobalPeriodicClear(fn) {
  const index = periodicClearList.indexOf(fn);
  if (index !== -1) {
    periodicClearList.splice(index, 1);
  }
}

function identity(value) {
  return value;
}

function isFunction(fn) {
  return typeof fn === 'function';
}

function get(is, arr, v) {
  let result;
  arr.forEach((tmp) => {
    if (is(tmp)) {
      result = tmp;
    }
  });
  return result || v;
}

function getWaitingPromise(list) {
  return new Promise((resolve, reject) => list.push({
    resolve,
    reject,
  }));
}

function handlePromiseCache(promiseCache) {
  promiseCache.list.forEach((item) => {
    if (promiseCache.rejectError) {
      return item.reject(promiseCache.rejectError);
    }
    return item.resolve(promiseCache.resolveData);
  });
}

function memorize(fn, _hasher, _ttl) {
  const map = new Map();
  let ttl = get(Number.isInteger, [_hasher, _ttl], 0);
  const hasher = get(isFunction, [_hasher, _ttl], identity);
  const emitter = new EventEmitter();
  const memorizeFn = function memorizeFn() {
    const args = Array.from(arguments);
    /* eslint prefer-spread:0 */
    const key = hasher.apply(null, args);
    const item = map.get(key);
    const now = Date.now();
    // !ttl表示只是并发的请求使用相同的promise
    if (item) {
      if (item.status === 'processing') {
        return getWaitingPromise(item.list);
      }
      if (!ttl || (now - item.createdAt < ttl)) {
        item.hits += 1;
        memorizeFn.emit('hit', key);
        if (item.rejectError) {
          return Promise.reject(item.rejectError);
        }
        return Promise.resolve(item.resolveData);
      }
    }
    const promiseCache = {
      status: 'processing',
      list: [],
      hits: 0,
      createdAt: now,
    };
    map.set(key, promiseCache);
    memorizeFn.emit('add', key);
    const p = fn.apply(this, args);
    setImmediate(() => {
      p.then((data) => {
        memorizeFn.emit('resolve', key);
        promiseCache.resolveData = data;
        promiseCache.status = 'complete';
        handlePromiseCache(promiseCache);
        if (!ttl) {
          memorizeFn.delete(key);
        }
      }, (err) => {
        memorizeFn.emit('reject', key);
        promiseCache.rejectError = err;
        promiseCache.status = 'complete';
        handlePromiseCache(promiseCache);
        if (!ttl) {
          memorizeFn.delete(key);
        }
      });
    });
    return getWaitingPromise(promiseCache.list);
  };
  memorizeFn.unmemorized = fn;
  memorizeFn.delete = (key) => {
    /* istanbul ignore if */
    if (!map.get(key)) {
      return null;
    }
    memorizeFn.emit('delete', key);
    return map.delete(key);
  };
  memorizeFn.get = key => map.get(key);
  memorizeFn.clear = () => map.clear();
  memorizeFn.size = () => map.size;
  memorizeFn.getTTL = () => ttl;
  memorizeFn.setTTL = (v) => {
    if (v) {
      ttl = v;
    }
  };
  let timer;
  const periodicClear = () => {
    const iter = map.entries();
    const now = Date.now();
    let arr = iter.next().value;
    while (arr) {
      const key = arr[0];
      const value = arr[1];
      if (value.createdAt + ttl < now) {
        map.delete(key);
      }
      arr = iter.next().value;
    }
  };
  periodicClearList.push(periodicClear);
  memorizeFn.periodicClear = (interval) => {
    removeFromGlobalPeriodicClear(periodicClear);
    /* istanbul ignore if */
    if (timer) {
      clearInterval(timer);
    }
    timer = setInterval(periodicClear, interval).unref();
    return timer;
  };
  Object.getOwnPropertyNames(EventEmitter.prototype).forEach((name) => {
    if (name !== 'constructor' && isFunction(emitter[name])) {
      memorizeFn[name] = emitter[name].bind(emitter);
    }
  });
  return memorizeFn;
}

memorize.periodicClear = interval => setInterval(globalPeriodicClear, interval).unref();

module.exports = memorize;
