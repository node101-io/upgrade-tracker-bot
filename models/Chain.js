const async = require('async');
const mongoose = require('mongoose');

const getChain = require('./functions/getChain');
const getLatestBlockHeight = require('./functions/getLatestBlockHeight');
const getLatestUpdate = require('./functions/getLatestUpdate');
const getRestAPIListFromIdentifier = require('./functions/getRestAPIURLFromIdentifier');

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
    type: Boolean,
    default: false
  },
  latest_update_status: {
    type: Boolean,
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

  if (!data.average_block_time || typeof data.average_block_time != 'number' || data.average_block_time < 0)
    return callback('bad_request');

  const identifier = data.identifier.trim();

  getRestAPIListFromIdentifier(identifier, (err, rest_api_list) => {
    if (err) return callback(err);

    const call_data = {
      identifier,
      rest_api_list
    };

    getLatestBlockHeight(call_data, (err, latest_block_height) => {
      if (err) return callback(err);

      getLatestUpdate(call_data, (err, latest_update) => {
        if (err) return callback(err);

        const newChain = new Chain({
          identifier: data.identifier,
          average_block_time: data.average_block_time,
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

ChainSchema.statics.findChainByIdentifierAndUpdate = function (_identifier, data, callback) {
  const Chain = this;

  if (!_identifier || typeof _identifier != 'string' || !_identifier.length || _identifier.length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.average_block_time || typeof data.average_block_time != 'number' || data.average_block_time < 0)
    return callback('bad_request');

  const identifier = _identifier.trim();

  Chain.findOneAndUpdate({
    identifier
  }, { $set: {
    average_block_time: data.average_block_time
  }}, { new: true }, (err, chain) => {
    if (err) return callback('database_error');
    if (!chain) return callback('document_not_found');

    getChain(chain, (err, chain) => {
      if (err) return callback(err);

      return callback(null, chain);
    });
  });
};

ChainSchema.statics.findChainByIdentifierAndAutoUpdate = function (_identifier, callback) {
  const Chain = this;

  if (!_identifier || typeof _identifier != 'string' || !_identifier.length || _identifier.length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  const identifier = _identifier.trim();

  Chain.findChainByIdentifier(identifier, (err, chain) => {
    if (err) return callback(err);

    getRestAPIListFromIdentifier(identifier, (err, rest_api_list) => {
      if (err) return callback(err);

      const call_data = {
        identifier,
        rest_api_list
      };

      getAverageBlockTime(call_data, (err, average_block_time) => {
        if (err) return callback(err);
    
        getLatestBlockHeight(call_data, (err, latest_block_height) => {
          if (err) return callback(err);
    
          getLatestUpdate(call_data, (err, latest_update) => {
            if (err) return callback(err);
    
            Chain.findOneAndUpdate({
              identifier
            }, { $set: {
              average_block_time,
              latest_block_height,
              latest_update_id: latest_update.id,
              latest_update_block_height: latest_update.block_height,
              is_latest_update_active: latest_update.block_height <= latest_block_height,
              latest_update_status: !chain.latest_update_status || chain.latest_update_id != latest_update.id ? false : true
            }}, {
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

ChainSchema.statics.findChainsWithActiveUpdate = function (callback) {
  const Chain = this;

  Chain.find({
    is_latest_update_active: false
  }, (err, chains) => {
    if (err) return callback('database_error');

    async.timesSeries(
      chains.length,
      (time, next) => getChain(chains[time], (err, chain) => next(err, chain)),
      (err, chains) => callback(err, chains)
    );
  });
};

ChainSchema.statics.findChainsWithMissedUpdateAndUpdateLastPingTime = function (callback) {
  const Chain = this;

  Chain.find({
    is_latest_update_active: false,
    latest_update_status: false,
    latest_update_missed_last_message_time: { $lte: Date.now() - MISSED_UPDATE_PING_INTERVAL }
  }, (err, chains) => {
    if (err) return callback('database_error');
    
    async.timesSeries(
      chains.length,
      (time, next) => Chain.findByIdAndUpdate(
        chains[time]._id,
        { $set: {
          latest_update_missed_last_message_time: Date.now()
        } },
        { new: true },
        (err, chain) => {
          if (err) return next('database_error');
          if (!chain) return next('document_not_found');

          getChain(chain, (err, chain) => next(err, chain));
        }
      ),
      (err, chains) => callback(err, chains)
    );
  });
};

module.exports = mongoose.model('Chain', ChainSchema);
