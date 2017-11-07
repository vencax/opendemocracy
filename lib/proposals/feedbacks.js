
module.exports = function (api, MW, ProposalFeedback, createError, startTransaction, manager) {
  //
  function _beforeCreate (req, res, next) {
    const value = parseInt(req.body.value)
    if (isNaN(value) || value !== 1) {
      return next(createError('wrong value, must be 1'))
    }
    if (req.fetched.get('status') !== 'discussing') {
      return next(createError('too late'))
    }
    next()
  }

  function _create (req, res, next) {
    startTransaction(t => {
      ProposalFeedback.fetchAll({proposal: req.params.id})
      .then((feedbacks) => {
        return manager.onNewProposalFeedback(req.fetched, feedbacks, t)
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
        fback.nextstatus = req.fetched.get('status')
        res.status(201).json(fback)
        next()
      })
      .catch(t.rollback)
    })
    .catch(next)
  }
  api.post('/:id/feedbacks', MW.fetch, _beforeCreate, _create)

  // --------------------------------------------------------------------------

  function _loadProposalFeedback (req, res, next) {
    new ProposalFeedback({uid: req.user.id, proposalid: req.params.id}).fetch()
    .then((feedback) => {
      res.json(feedback)
    })
    .catch(next)
  }
  api.get('/:id/feedbacks', _loadProposalFeedback)

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
