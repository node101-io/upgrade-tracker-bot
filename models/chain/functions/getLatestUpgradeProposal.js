const fetch = require('node-fetch');

const APIRoutes = [
  '/cosmos/gov/v1/proposals?pagination.reverse=true&proposal_status=PROPOSAL_STATUS_VOTING_PERIOD',
  '/cosmos/gov/v1/proposals?pagination.reverse=true&status=PROPOSAL_STATUS_VOTING_PERIOD',
  '/cosmos/gov/v1beta1/proposals?pagination.reverse=true&proposal_status=2',
];

const fetchLatestUpdate = (index, rest_api_list, callback) => {
  fetch(rest_api_list[index])
    .then(res => res.json())
    .then(json => {
      if ('proposals' in json) {
        for (const proposal of json.proposals)
          if (proposal.messages?.[0]?.content?.['@type'].includes('SoftwareUpgradeProposal') || proposal.content?.['@type'].includes('SoftwareUpgradeProposal'))
            return callback(null, {
              id: proposal.id || proposal.proposal_id,
              block_height: proposal.messages?.[0]?.content?.plan?.height || proposal.content?.plan?.height,
            });

        return callback(null, null);
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
  let rest_api_list_modified = [];

  for (const rest_api of rest_api_list)
    for (const APIRoute of APIRoutes)
      rest_api_list_modified.push(`${rest_api}${APIRoute}`);

  const random_index = Math.floor(Math.random() * rest_api_list_modified.length);
  rest_api_list_modified = rest_api_list_modified.slice(random_index).concat(rest_api_list_modified.slice(0, random_index));

  fetchLatestUpdate(0, rest_api_list_modified, (err, update) => {
    if (err)
      return callback(err);

    return callback(null, update);
  });
};
