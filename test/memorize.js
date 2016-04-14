'use strict';
const assert = require('assert');
const memorize = require('..');

const delay = (ms) => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

describe('promise-memorize', () => {
  it('cache promise for parallel call', (done) => {
    let count = 0;
    const originalGet = () => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(count++);
        }, 10);
      });
    };
    const get = memorize(originalGet);

    get().then(count => {
      assert.equal(count, 0);
    }).catch(done);

    get().then(count => {
      assert.equal(count, 0);
      return get();
    }).then(count => {
      assert.equal(count, 1);
      done();
    }).catch(done);
  });

  it('cache promise with ttl', (done) => {
    let count = 0;
    const originalGet = () => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(count++);
        }, 10);
      });
    };
    const get = memorize(originalGet, 100);
    get().then(count => {
      assert.equal(count, 0);
      return get();
    }).then(count => {
      assert.equal(count, 0);
      return delay(100).then(get);
    }).then(count => {
      assert.equal(count, 1);
      done();
    }).catch(done);
  });

  it('cache promise with custon hasher', (done) => {
    let count = 0;
    const originalGet = (name, id) => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(count++);
        }, 10);
      });
    };

    const get = memorize(originalGet, (name, id) => {
      return `${name}_${id}`;
    });

    get().then(count => {
      assert.equal(count, 0);
    }).catch(done);

    get().then(count => {
      assert.equal(count, 0);
      return get();
    }).then(count => {
      assert.equal(count, 1);
      done();
    }).catch(done);

  });

});