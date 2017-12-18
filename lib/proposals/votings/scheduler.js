const schedule = require('node-schedule')

module.exports = (db) => {
  //
  function _log (err) {
    console.error(err)
  }

  function _schedule (proposal) {
    const begin = proposal.get('votingbegins')
    begin && schedule.scheduleJob(new Date(begin), () => {
      proposal.save({
        status: 'voting',
        laststatuschange: new Date()
      }, {patch: true}).catch(_log)
    })
    const end = proposal.get('votingends')
    schedule.scheduleJob(new Date(end), () => {
      proposal.save({
        status: 'locked',
        laststatuschange: new Date()
      }, {patch: true}).catch(_log)
    })
  }

  db.models.Proposal.query((qb) => {
    qb.whereNotNull('votingbegins').orWhereNotNull('votingends')
  }).fetchAll()
  .then((toBeOpened) => {
    toBeOpened.map((p) => _schedule(p))
  })
  .catch(_log)

  return (proposal) => {
    _schedule(proposal)
  }
}
