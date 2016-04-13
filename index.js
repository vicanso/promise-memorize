'use strict';
function identity(value) {
  return value;
}

function memorize(fn, hasher) {
  const map = new Map();
  const _hasher = hasher || identity;
  return function() {
    const args = Array.from(arguments);
    const key = _hasher.apply(null, args);
    const prevPromise = map.get(key);
    if (prevPromise) {
      return prevPromise;
    }
    const p = fn();
    map.set(key, p);
    p.then(data => {
      map.delete(key);
      return data;
    }, err => {
      map.delete(key);
      throw err;
    });
    return p;
  };
}



module.exports = memorize;