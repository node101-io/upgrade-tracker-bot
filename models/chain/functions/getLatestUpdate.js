const fetch = require('node-fetch');

const fetchLatestUpdate = (index, rest_api_list, callback) => {
  fetch(`${rest_api_list[index]}/cosmos/gov/v1/proposals?pagination.reverse=true&proposal_status=PROPOSAL_STATUS_VOTING_PERIOD`)
    .then(res => res.json())
    .then(json => {
      json?.proposals.forEach(proposal => {
        if (proposal.messages?.[0]?.content?.['@type'].includes('SoftwareUpgradeProposal'))
          return callback(null, {
            id: proposal.id,
            block_height: proposal.messages[0].content.plan?.height,
          });
      });

      if (index < rest_api_list.length - 1)
        return fetchLatestUpdate(index + 1, rest_api_list, callback);

      return callback('document_not_found', null);
    })
    .catch(_ => {
      if (index < rest_api_list.length - 1)
        return fetchLatestUpdate(index + 1, rest_api_list, callback);

      return callback('fetch_error', null);
    });
};

module.exports = (rest_api_list, callback) => {
  return fetchLatestUpdate(0, rest_api_list, callback);
};
