const CreateVoting = require('./votings/creation')

module.exports = (db) => {
  return {
    hasEnoughFeedback: (proposal, feedbacks) => {
      return feedbacks.length > 20
    },
    createVoting: (proposal, transaction) => {
      return CreateVoting(db.models.Voting, proposal, transaction)
    },
    nextStatus: (proposal) => {
      return 'thinking'
    }
  }
}
