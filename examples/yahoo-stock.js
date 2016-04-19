'use strict';
const request = require('superagent');
const memorize = require('..');

function getStock(code, start, end, period) {
  const startArr = start.split('-');
  const endArr = end.split('-');
  const url = `http://ichart.yahoo.com/table.csv?s=${code}&a=${startArr[1]}&b=${startArr[2]}&c=${startArr[0]}&d=${endArr[1]}&e=${endArr[2]}&f=${endArr[0]}&g=${period}`;
  
  return new Promise((resolve, reject) => {
    console.info('GET yahoo:%s', url);
    request.get(url).end((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.text);
      }
    });
  });
}

const memorizeGetStock = memorize(getStock, (code, start, end, period) => {
  return `${code}-${start}-${end}-${period}`;
}, 10 * 1000);


memorizeGetStock('600000.SS', '2016-01-01', '2016-03-31', 'd').then((csv) => {
  console.info('day data size:%d', csv.length);
}).catch(console.error);

memorizeGetStock('600000.SS', '2016-01-01', '2016-03-31', 'd').then((csv) => {
  console.info('day data size:%d', csv.length);
}).catch(console.error);

memorizeGetStock('600000.SS', '2016-01-01', '2016-03-31', 'w').then((csv) => {
  console.info('week data size:%d', csv.length);
}).catch(console.error);