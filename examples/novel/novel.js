'use strict';
const moment = require('moment');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongodbUri = process.env.MONGO;
mongoose.Promise = global.Promise;
mongoose.connect(mongodbUri, err => {
  if (err) {
    console.error(err);
  } else {
    console.info(`${mongodbUri} init success`);
  }
});

module.exports = mongoose.model('Novel', new Schema({
  name: String,
  author: String,
  desc: String,
  chapters: Array,
  createdAt: {
    type: String,
    default: () => {
      return moment().toISOString();
    }
  },
}));
