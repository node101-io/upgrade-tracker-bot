const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const getLatestBlockHeight = require('./functions/getLatestBlockHeight');
const getAverageBlockTime = require('./functions/getAverageBlockTime');
const getLatestUpdate = require('./functions/getLatestUpdate');

const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e3;
const MISSED_UPDATE_PING_INTERVAL = 15 * 60 * 1e3; // 15 mins

const Schema = mongoose.Schema;

const ChainSchema = new Schema({
  identifier: {
    type: String,
    unique: true,
    required: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  average_block_time: {
    type: Number,
    required: true,
    min: 0
  },
  latest_block_height: {
    type: Number,
    required: true,
    min: 0
  },
  latest_update_id: {
    type: String,
    default: null,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  latest_update_block_height: {
    type: Number,
    default: null,
    min: 0
  },
  latest_update_status: {
    type: Bool,
    default: false
  },
  latest_update_missed_last_message_time: {
    type: Date,
    default: null
  }
});

// osmosis set done 

module.exports = mongoose.model('Chain', ChainSchema);
