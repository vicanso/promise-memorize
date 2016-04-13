'use strict';
const assert = require('assert');
const memorize = require('..');
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
});