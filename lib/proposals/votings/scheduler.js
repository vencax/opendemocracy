const schedule = require('node-schedule')

module.exports = (db) => {
  //
  function _log (err) {
    console.error(err)
  }

  function _schedule (proposal) {
    proposal.get('status') === 'thinking' &&
    schedule.scheduleJob(new Date(proposal.get('votingbegins')), () => {
      proposal.save({
        status: 'voting',
        laststatuschange: new Date()
      }, {patch: true}).catch(_log)
    })
    schedule.scheduleJob(new Date(proposal.get('votingends')), () => {
      proposal.save({
        status: 'locked',
        laststatuschange: new Date()
      }, {patch: true}).catch(_log)
    })
  }

  db.models.Proposal.query('where', 'status', 'in', ['thinking', 'voting']).fetchAll()
  .then((toBeOpened) => {
    toBeOpened.map((p) => _schedule(p))
  })
  .catch(_log)

  return (proposal) => {
    _schedule(proposal)
  }
}
