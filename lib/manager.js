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
    }
  }
}
