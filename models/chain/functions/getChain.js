module.exports = (chain, callback) => {
  if (!chain || !chain._id)
    return callback('document_not_found');

  return callback(null, {
    identifier: chain.identifier,
    mintscan_identifier: chain.mintscan_identifier,
    average_block_time: chain.average_block_time,
    latest_block_height: chain.latest_block_height,
    latest_update_id: chain.latest_update_id,
    latest_update_block_height: chain.latest_update_block_height,
    is_missed_last_update: chain.is_missed_last_update,
    latest_update_missed_last_message_time: chain.latest_update_missed_last_message_time,
  });
};