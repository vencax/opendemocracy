const moment = require('moment')
let requiredFeedbackCount = parseInt(process.env.REQIRED_FEEDBACK_COUNT) || 20

module.exports = (db) => {
  const schedule = require('./proposals/votings/scheduler')(db)

  return {
    onNewProposalFeedback: (proposal, feedbacks, transaction) => {
      if (feedbacks.length + 1 > (requiredFeedbackCount - 1)) { // +1 for this new one
        const saveOpts = {patch: true, transacting: transaction}
        return proposal.save({
          status: 'thinking',
          laststatuschange: new Date(),
          votingbegins: moment().add('days', 1).toDate(),
          votingends: moment().add('days', 2).toDate()
        }, saveOpts)
        .then((saved) => {
          schedule(saved)
          return saved
        })
      }
      return proposal
    },

    onProposalPublish: (proposal) => {
      switch (proposal.get('typ')) {
        case 'proposal':
          // TODO: check it has at least 2 options??
          return proposal.save({
            status: 'discussing',
            laststatuschange: new Date()
          }, {patch: true})
        case 'eventdate':
          const begin = moment().add('minutes', 10)
          return proposal.save({
            status: 'discussing',
            laststatuschange: new Date(),
            votingbegins: begin.toDate(),
            votingends: begin.add('days', 2).toDate()
          }, {patch: true})
          .then((saved) => {
            schedule(saved)
            return saved
          })
        default:
          return proposal
      }
    }
  }
}
