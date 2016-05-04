'use strict';
const util = require('util');
const EventEmitter = require('events');
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
  const emitter = new EventEmitter();
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
    memorizeFn.emit('add', key);
    p.then((data) => {
      memorizeFn.emit('resolve', key);
      if (!ttl) {
        memorizeFn.delete(key);
      }
      return data;
    }, (err) => {
      memorizeFn.emit('reject', key);
      if (!ttl) {
        memorizeFn.delete(key);
      }
      throw err;
    });

    return p;
  };
  memorizeFn.unmemorized = fn;
  memorizeFn.delete = (key) => {
    /* istanbul ignore else */
    if (map.get(key)) {
      memorizeFn.emit('delete', key);
      return map.delete(key);
    }
  };
  memorizeFn.clear = () => {
    return map.clear();
  };
  memorizeFn.size = () => map.size;
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
  memorizeFn.periodicClear = (interval) => {
    /* istanbul ignore if */
    if (timer) {
      clearInterval(timer);
    }
    timer = setInterval(periodicClear, interval).unref();
    return timer;
  };
  Object.getOwnPropertyNames(EventEmitter.prototype).forEach(name => {
    if (name !== 'constructor' && util.isFunction(emitter[name])) {
      memorizeFn[name] = emitter[name].bind(emitter);
    }
  });
  return memorizeFn;
}

module.exports = memorize;
