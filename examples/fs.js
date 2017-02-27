'use strict';
const memorize = require('..');
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
  return readFileMemo('a.js');
}).catch(console.error);
