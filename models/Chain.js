const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const getAverageBlockTime = require('./functions/getAverageBlockTime.js');
const getChain = require('./functions/getChain.js');
const getLatestBlockHeight = require('./functions/getLatestBlockHeight.js');
const getLatestUpdate = require('./functions/getLatestUpdate.js');
const getRestAPIURLFromIdentifier = require('./functions/getRestAPIURLFromIdentifier.js');

const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e3;
const MISSED_UPDATE_PING_INTERVAL = 15 * 60 * 1e3; // 15 mins

const Schema = mongoose.Schema;

const ChainSchema = new Schema({
  identifier: {
    type: String,
    unique: true,
    required: true,
    trim: true,
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
  is_latest_update_active: {
    type: Bool,
    default: false
  },
  latest_update_status: {
    type: Bool,
    default: true
  },
  latest_update_missed_last_message_time: {
    type: Date,
    default: null
  }
});

ChainSchema.statics.createChain = function (data, callback) {
  const Chain = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.identifier || typeof data.identifier != 'string' || !data.identifier.length || data.identifier.length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request'); 

  const identifier = data.identifier.trim();

  getRestAPIURLFromIdentifier(identifier, (err, rest_api_url) => {
    if (err) return callback(err);

    const call_data = {
      identifier,
      rest_api_url
    };

    getAverageBlockTime(call_data, (err, average_block_time) => {
      if (err) return callback(err);
  
      getLatestBlockHeight(call_data, (err, latest_block_height) => {
        if (err) return callback(err);
  
        getLatestUpdate(call_data, (err, latest_update) => {
          if (err) return callback(err);
  
          const newChain = new Chain({
            identifier: data.identifier,
            average_block_time,
            latest_block_height,
            latest_update_id: latest_update.id,
            latest_update_block_height: latest_update.block_height,
            is_latest_update_active: latest_update.block_height <= latest_block_height
          });
  
          newChain.save((err, chain) => {
            if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
              return callback('duplicated_unique_field');
            if (err) return callback('database_error');
        
            getChain(chain, (err, chain) => {
              if (err) return callback(err);
        
              return callback(null, chain);
            });
          });
        });
      });
    });
  });
};

ChainSchema.statics.findChainByIdentifier = function (identifier, callback) {
  const Chain = this;

  if (!identifier || typeof identifier != 'string' || !identifier.length || identifier.length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  Chain.findOne({
    identifier: identifier.trim()
  }, (err, chain) => {
    if (err) return callback('database_error');
    if (!chain) return callback('document_not_found');

    return callback(null, chain);
  });
};

ChainSchema.statics.findChainByIdentifierAndFormat = function (identifier, callback) {
  const Chain = this;

  Chain.findChainByIdentifier(identifier, (err, chain) => {
    if (err) return callback(err);

    getChain(chain, (err, chain) => {
      if (err) return callback(err);

      return callback(null, chain);
    });
  });
};

ChainSchema.statics.findChainByIdentifierAndUpdate = function (_identifier, callback) {
  const Chain = this;

  if (!_identifier || typeof _identifier != 'string' || !_identifier.length || _identifier.length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  const identifier = _identifier.trim();

  Chain.findChainByIdentifier(identifier, (err, chain) => {
    if (err) return callback(err);

    getRestAPIURLFromIdentifier(identifier, (err, rest_api_url) => {
      if (err) return callback(err);

      const call_data = {
        identifier,
        rest_api_url
      };

      getAverageBlockTime(call_data, (err, average_block_time) => {
        if (err) return callback(err);
    
        getLatestBlockHeight(call_data, (err, latest_block_height) => {
          if (err) return callback(err);
    
          getLatestUpdate(call_data, (err, latest_update) => {
            if (err) return callback(err);
    
            Chain.findOneAndUpdate({
              identifier
            }, {
              average_block_time,
              latest_block_height,
              latest_update_id: latest_update.id,
              latest_update_block_height: latest_update.block_height,
              is_latest_update_active: latest_update.block_height <= latest_block_height,
              latest_update_status: !chain.latest_update_status || chain.latest_update_id != latest_update.id ? false : true
            }, {
              new: true
            }, (err, chain) => {
              if (err) return callback('database_error');
              if (!chain) return callback('document_not_found');
    
              getChain(chain, (err, chain) => {
                if (err) return callback(err);
    
                return callback(null, chain);
              });
            });
          });
        });
      });
    });
  });
};

ChainSchema.statics.findChains = function (callback) {
  const Chain = this;

  Chain
    .find()
    .sort({ identifier: 1 })
    .then(chains => async.timesSeries(
      chains.length,
      (time, next) => getChain(chains[time], (err, chain) => next(err, chain)),
      (err, chains) => callback(err, chains)
    ))
    .catch(_ => callback('database_error'));
};

ChainSchema.statics.findNotUpdatedChains = function (callback) {
  const Chain = this;

  Chain.find({
    is_latest_update_active: false,
    latest_update_status: false
  }, (err, chains) => {
    if (err) return callback('database_error');
    if (!chains || !chains.length) return callback(null, []);

    return callback(null, chains);
  });
};

module.exports = mongoose.model('Chain', ChainSchema);
