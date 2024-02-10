const async = require('async');
const mongoose = require('mongoose');

const getChain = require('./functions/getChain');
const getLatestBlockHeight = require('./functions/getLatestBlockHeight');
const getLatestUpgradeProposal = require('./functions/getLatestUpgradeProposal');
const getRestAPIListAndMintscanIdFromIdentifier = require('./functions/getRestAPIListAndMintscanIdFromIdentifier');

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
  mintscan_identifier: {
    type: String,
    required: false,
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
  is_missed_last_update: {
    type: Boolean,
    default: false
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

  if (!data.average_block_time || isNaN(Number(data.average_block_time)) || Number(data.average_block_time) < 0)
    return callback('bad_request');

  const identifier = data.identifier.trim();

  getRestAPIListAndMintscanIdFromIdentifier(identifier, (err, res) => {
    if (err) return callback(err);

    getLatestBlockHeight(res.rest_api_list, (err, latest_block_height) => {
      if (err) return callback(err);

      getLatestUpgradeProposal(res.rest_api_list, (err, latest_update) => {
        if (err) return callback(err);

        const newChain = new Chain({
          identifier: data.identifier,
          mintscan_identifier: res.mintscan_identifier || null,
          average_block_time: Number(data.average_block_time),
          latest_block_height,
          latest_update_id: latest_update ? latest_update.id : null,
          latest_update_block_height: latest_update ? latest_update.block_height : null,
          is_missed_last_update: latest_update ? latest_update.block_height <= latest_block_height : false,
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

ChainSchema.statics.findChainByIdentifierAndSetStatus = function (identifier, callback) {
  const Chain = this;

  if (!identifier || typeof identifier != 'string' || !identifier.length || identifier.length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  Chain.findOneAndUpdate({
    identifier: identifier.trim()
  }, { $set: {
    is_missed_last_update: false,
    latest_update_id: null,
    latest_update_block_height: null,
    latest_update_missed_last_message_time: null
  }}, { new: true }, (err, chain) => {
    if (err) return callback('database_error');
    if (!chain) return callback('document_not_found');

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

  if (!data.average_block_time || isNaN(Number(data.average_block_time)) || Number(data.average_block_time) < 0)
    return callback('bad_request');

  const identifier = _identifier.trim();

  Chain.findOneAndUpdate({
    identifier
  }, { $set: {
    average_block_time: Number(data.average_block_time)
  }}, { new: true }, (err, chain) => {
    if (err) return callback('database_error');
    if (!chain) return callback('document_not_found');

    getChain(chain, (err, chain) => {
      if (err) return callback(err);

      return callback(null, chain);
    });
  });
};

ChainSchema.statics.findChainByIdentifierAndDelete = function (identifier, callback) {
  const Chain = this;

  if (!identifier || typeof identifier != 'string' || !identifier.length || identifier.length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  Chain.findOneAndDelete({ identifier: identifier.trim() }, (err, chain) => {
    if (err) return callback('database_error');
    if (!chain) return callback('document_not_found');

    return callback(null);
  });
};

ChainSchema.statics.findChainByIdentifierAndAutoUpdate = function (_identifier, callback) {
  const Chain = this;

  if (!_identifier || typeof _identifier != 'string' || !_identifier.length || _identifier.length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  const identifier = _identifier.trim();

  Chain.findChainByIdentifier(identifier, (err, chain) => {
    if (err) return callback(err);

    getRestAPIListAndMintscanIdFromIdentifier(identifier, (err, res) => {
      if (err) return callback(err);

      getLatestBlockHeight(res.rest_api_list, (err, latest_block_height) => {
        if (err) return callback(err);
  
        getLatestUpgradeProposal(res.rest_api_list, (err, latest_update) => {
          if (err) return callback(err);

          const update = {};

          if (chain.mintscan_identifier != res.mintscan_identifier)
            update.mintscan_identifier = res.mintscan_identifier;

          if (chain.latest_block_height < latest_block_height)
            update.latest_block_height = latest_block_height;

          if (latest_update && latest_update.id != chain.latest_update_id && latest_update.block_height > chain.latest_block_height) {
            update.latest_update_id = latest_update.id;
            update.latest_update_block_height = latest_update.block_height;
          };

          if (chain.latest_update_block_height && chain.latest_update_block_height <= chain.latest_block_height)
            update.is_missed_last_update = true;

          if (!Object.keys(update).length)
            return callback(null, chain);

          Chain.findOneAndUpdate({
            identifier
          }, { $set: update }, {
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
};

ChainSchema.statics.findChainsAndAutoUpdateAll = function (callback) {
  const Chain = this;

  Chain.find({}, (err, chains) => {
    if (err) return callback('database_error');

    async.timesSeries(
      chains.length,
      (time, next) => Chain.findChainByIdentifierAndAutoUpdate(chains[time].identifier, (err, chain) => next(err, chain)),
      (err, chains) => callback(err, chains)
    );
  });
};

ChainSchema.statics.findChains = function (callback) {
  const Chain = this;

  Chain
    .find()
    .sort({ is_missed_last_update: 1, identifier: 1})
    .then(chains => async.timesSeries(
      chains.length,
      (time, next) => getChain(chains[time], (err, chain) => next(err, chain)),
      (err, chains) => callback(err, chains)
    ))
    .catch(_ => callback('database_error'));
};

ChainSchema.statics.findChainsByFilters = function (data, callback) {
  const Chain = this;

  if (!data || typeof data != 'object') {
    return callback('bad_request')};

  const filters = {};

  if (data.identifier && typeof data.identifier == 'string' && data.identifier.trim().length) {
    filters.identifier = { $regex: data.identifier.trim(), $options: 'i' };
  };

  Chain
    .find(filters)
    .sort({ identifier: 1 })
    .then(chains => async.timesSeries(
      chains.length,
      (time, next) => getChain(chains[time], (err, chain) => next(err, chain)),
      (err, chains) => {
        if (err) return callback(err);

        return callback(null, {
          search: null,
          chains
        });
      })
    )
    .catch(err => callback(null, err));
};

ChainSchema.statics.findChainsWithActiveUpdate = function (callback) {
  const Chain = this;

  Chain.find({
    is_missed_last_update: false,
    latest_update_block_height: { $ne: null },
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
    is_missed_last_update: true,
    $or: [
      { latest_update_missed_last_message_time: { $lt: Date.now() - MISSED_UPDATE_PING_INTERVAL } },
      { latest_update_missed_last_message_time: null }
    ]
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
