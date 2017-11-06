const moment = require('moment')

module.exports = function (Voting, proposal, transaction) {
  //
  let voting = new Voting({
    proposalid: proposal.id,
    begins: moment().add('days', 1).toDate(),
    ends: moment().add('days', 2).toDate()
  })
  return voting.save(null, {transacting: transaction})
}
