
module.exports = function (api, MW, ProposalFeedback, createError, startTransaction, manager) {
  //
  function _beforeCreate (req, res, next) {
    const value = parseInt(req.body.value)
    if (isNaN(value) || value !== 1) {
      return next(createError('wrong value, must be 1'))
    }
    if (req.fetched.status === 'voting') {
      return next(createError('too late'))
    }
    next()
  }

  function _create (req, res, next) {
    startTransaction(t => {
      ProposalFeedback.fetchAll({proposal: req.params.id})
      .then((feedbacks) => {
        // check if the proposal has enough feedback
        if (manager.hasEnoughFeedback(feedbacks)) {
          const saveOpts = {patch: true, transacting: t}
          return req.fetched.save({status: 'voting'}, saveOpts).then((saved) => {
            manager.createVoting(saved, t)
          })
        }
      })
      .then(() => {
        const r = new ProposalFeedback({
          proposalid: req.params.id,
          uid: req.user.id,
          value: req.body.value
        })
        return r.save(null, {transacting: t})
      })
      .then(fback => {
        t.commit()
        if (req.fetched.get('status') !== 'discussing') {
          fback.votingcreated = true
        }
        res.status(201).json(fback)
        next()
      })
      .catch(t.rollback)
    })
    .catch(next)
  }
  api.post('/:id/feedbacks', MW.fetch, _beforeCreate, _create)

  // --------------------------------------------------------------------------

  function _beforeRelDelete (req, res, next) {
    if (req.fetched.status === 'voting') {
      return next(createError('too late'))
    }
    req.query = {uid: req.user.id}  // delete mine feedback
    req.params.relation = 'feedbacks' // tell which relation to use
    next()
  }
  api.delete('/:id/feedbacks',
    MW.fetch, _beforeRelDelete, MW.fetch_rel, MW.delete_rel)
}
