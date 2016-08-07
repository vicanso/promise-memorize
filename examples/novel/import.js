'use strict';
const Novel = require('./novel');
const fs = require('fs');
const _ = require('lodash');
const moment = require('moment');

const getRandomWord = (length) => {
  const charList = '云雾深处传来一声龙啸啸声里满是痛楚不甘和怅悔它在告诉整个世界五片大陆自己先前的犹豫带来了怎样沉痛的遗憾小道僮鼓起勇气回头望去只见溪水清澈溪两岸的火也已经熄了只有被烧焦的树木与烤裂的石头在述说先前那场战斗的恐怖山是无名青山庙是废弃佛庙两名徒儿大的道号余人小的叫陈长生西宁镇在周国境内大周王朝自八百年前起立道教为国教直至如今正统年间国教一统天下更是尊崇按道理来说师徒三人应该过着锦衣玉食的日子无奈西宁镇太过偏远那座破庙更加偏远平日里人烟罕见所以只能过着粗茶淡饭的生活'.split('');
  return _.shuffle(charList).join('').substring(0, length);
};

const getChapters = (total) => {
  const arr = [];
  for (let i = 0; i < total; i++) {
    const tmpArr = [
      getRandomWord(_.random(100, 200)),
      getRandomWord(_.random(100, 200)),
      getRandomWord(_.random(100, 200)),
      getRandomWord(_.random(100, 200)),
      getRandomWord(_.random(100, 200)),
      getRandomWord(_.random(100, 200)),
      getRandomWord(_.random(100, 200)),
    ];
    arr.push({
      title: getRandomWord(_.random(5, 10)),
      content: tmpArr.join('\n'),
      updatedAt: moment().toISOString(),
    });
  }
  return arr;
}

const createNovel = () => {
  const data = {
    name: getRandomWord(_.random(3, 8)),
    author: getRandomWord(_.random(3, 5)),
    desc: getRandomWord(_.random(100, 200)),
    chapters: getChapters(_.random(300, 1000)),
  };
  return new Novel(data).save();
}
let count = 0;
setInterval(() => {
  createNovel().then(doc => {
    console.info(++count);
  }).catch(err => {
    console.error(err);
  });
}, 100);



