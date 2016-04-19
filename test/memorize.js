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

  it('throw an error', (done) => {
    let count = 0;
    const originalGet = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('fail'));
        }, 10);
      });
    };
    const get = memorize(originalGet);
    const complete = (err) => {
      assert.equal(err.message, 'fail');
      count++;
      if (count === 2) {
        done();
      }
    };

    get().catch(complete);
    get().catch(complete);
  })

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

  it('cache promise with custom hasher', (done) => {
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

  it('delete and clear cache', (done) => {
    let count = 0;
    const originalGet = (id) => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(count++);
        }, 10);
      });
    };
    const get = memorize(originalGet, 100);
    const id = 'vicanso';
    get(id).then(count => {
      assert.equal(count, 0);
      get.delete(id)
      return get(id);
    }).then(count => {
      assert.equal(count, 1);
      get.clear();
      return get(id);
    }).then(count => {
      assert.equal(count, 2);
      done();
    }).catch(done);
  });

});