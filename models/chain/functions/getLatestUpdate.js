const fetch = require('node-fetch');

const APIRoutes = [
  '/cosmos/gov/v1/proposals?pagination.reverse=true&proposal_status=PROPOSAL_STATUS_VOTING_PERIOD',
  '/cosmos/gov/v1beta1/proposals?pagination.reverse=true&proposal_status=2',
];

const fetchLatestUpdate = (index, rest_api_list, callback) => {
  fetch(rest_api_list[index])
    .then(res => res.json())
    .then(json => {
      if (json.proposals) {
        for (const proposal of json.proposals)
          if (proposal.messages?.[0]?.content?.['@type'].includes('SoftwareUpgradeProposal'))
            return callback(null, {
              id: proposal.id,
              block_height: proposal.messages[0].content.plan?.height,
            });

        return callback('document_not_found', null);
      };

      if (index < rest_api_list.length - 1)
        return fetchLatestUpdate(index + 1, rest_api_list, callback);

      return callback('document_not_found', null);
    })
    .catch(_ => {
      if (index < rest_api_list.length - 1)
        return fetchLatestUpdate(index + 1, rest_api_list, callback);

      return callback('document_not_found', null);
    });
};

module.exports = (rest_api_list, callback) => {
  const new_rest_api_list = [];

  for (const rest_api of rest_api_list)
    for (const APIRoute of APIRoutes)
      new_rest_api_list.push(`${rest_api}${APIRoute}`);

  fetchLatestUpdate(0, new_rest_api_list, (err, update) => {
    if (err) return callback(err);

    return callback(null, update);
  });
};
