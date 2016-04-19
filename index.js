'use strict';
const util = require('util');

function identity(value) {
  return value;
}

function get(is, arr, v) {
  let result;
  arr.forEach(tmp => {
    if (is(tmp)) {
      result = tmp;
    }
  });
  return result || v;
}

function memorize(fn, _hasher, _ttl) {
  const map = new Map();
  const ttl = get(util.isNumber, [_hasher, _ttl], 0);
  const hasher = get(util.isFunction, [_hasher, _ttl], identity);
  const memorizeFn = function memorizeFn() {
    const args = Array.from(arguments);
    const key = hasher.apply(null, args);
    const item = map.get(key);
    const now = Date.now();
    // !ttl表示只是并发的请求使用相同的promise
    if (item && (!ttl || (now - item.createdAt < ttl))) {
      return item.promise;
    }
    const p = fn.apply(this, args);
    map.set(key, {
      promise: p,
      createdAt: now,
    });
    if (!ttl) {
      p.then((data) => {
        map.delete(key);
        return data;
      }, (err) => {
        map.delete(key);
        throw err;
      });
    }
    return p;
  };
  memorizeFn.unmemorized = fn;
  memorizeFn.delete = (key) => {
    map.delete(key);
  };
  memorizeFn.clear = () => {
    map.clear();
  };
  return memorizeFn;
}

module.exports = memorize;
