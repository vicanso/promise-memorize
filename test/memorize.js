'use strict';
const assert = require('assert');
const memorize = require('..');

const delay = (ms) => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

describe('promise-memorize', () => {
  let globalMemorize;
  it('set global periodic clear', (done) => {
    memorize.periodicClear(100);
    const get = memorize(() => {
      return Promise.resolve(1);
    }, 10);
    globalMemorize = get;
    get(1).then(count => {
      assert.equal(count, 1);
      done();
    });
  });


  it('set cache promise ttl', () => {
    const originalGet = () => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve();
        }, 10);
      });
    };
    const get = memorize(originalGet, 10);
    assert.equal(get.getTTL(), 10);
    get.setTTL(20);
    assert.equal(get.getTTL(), 20);
  });

  it('set stale for the cache promise', (done) => {
    let count = 0;
    const originalGet = () => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(count++);
        }, 1);
      });
    };
    const get = memorize(originalGet, 100);
    get.setStale(10);
    get().then((v) => {
      assert.equal(v, 0);
    }).catch(done);
    setTimeout(() => {
      get().then((v) => {
        assert.equal(v, 0);
      }).catch(done);
      get().then((v) => {
        assert.equal(v, 0);
      }).catch(done);
    }, 102);
    setTimeout(() => {
      get().then((v) => {
        assert.equal(v, 1);
        done();
      }).catch(done);
    }, 110);
  });

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

    get().then((count) => {
      assert.equal(count, 0);
    }).catch(done);

    get().then((count) => {
      assert.equal(count, 0);
      return get();
    }).then((count) => {
      assert.equal(count, 1);
      done();
    }).catch(done);
  });

  it('throw an error', done => {
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

  it('cache promise with ttl', done => {
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

  it('cache promise with custom hasher', done => {
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

  it('delete and clear cache', done => {
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


  it('set periodic clear', done => {
    const originalGet = (id) => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(0);
        }, 10);
      });
    };
    const get = memorize(originalGet, 50);
    get.periodicClear(10);
    const id = 'vicanso';
    get(id).then(count => {
      assert.equal(get.size(), 1);
      setTimeout(() => {
        assert.equal(get.size(), 0);
        done();
      }, 100);
    }).catch(done);
  });

  it('addListener', done => {
    const originalGet = (id) => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(0);
        }, 10);
      });
    };
    const memorizeGet = memorize(originalGet, 50);
    memorizeGet.on('hit', key => {
      const item = memorizeGet.get(key);
      assert.equal(item.hits, 1);
      assert.equal(key, id);
    });
    memorizeGet.on('add', key => {
      assert.equal(key, id);
    });
    memorizeGet.on('delete', key => {
      assert.equal(key, id);
      done();
    });
    const id = 'vicanso';
    memorizeGet(id).then(count => {
      assert.equal(count, 0);
      return memorizeGet(id);
    }).then(count => {
      assert.equal(count, 0);
      memorizeGet.delete(id);
    });
  });

  it('global periodic clear success', () => {
    assert(!globalMemorize.get(1));
  });

});
