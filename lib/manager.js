const moment = require('moment')

module.exports = (db) => {
  return {
    onNewProposalFeedback: (proposal, feedbacks, transaction) => {
      if (feedbacks.length > 20) {
        const saveOpts = {patch: true, transacting: transaction}
        return proposal.save({
          status: 'thinking',
          laststatuschange: new Date(),
          begins: moment().add('days', 1).toDate(),
          ends: moment().add('days', 2).toDate()
        }, saveOpts)
      }
      return proposal
    }
  }
}
