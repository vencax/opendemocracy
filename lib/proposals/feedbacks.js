
module.exports = function (api, MW, g, manager) {
  //
  function _beforeCreate (req, res, next) {
    const value = parseInt(req.body.value)
    if (isNaN(value) || value !== 1) {
      return next(g.createError('wrong value, must be 1'))
    }
    if (req.fetched.get('status') !== 'discussing') {
      return next(g.createError('too late'))
    }
    next()
  }

  function _create (req, res, next) {
    g.startTransaction(t => {
      g.models.ProposalFeedback.fetchAll({proposalid: req.params.id})
      .then((feedbacks) => {
        return manager.onNewProposalFeedback(req.fetched, feedbacks, t)
      })
      .then(() => {
        const r = new g.models.ProposalFeedback({
          proposalid: req.params.id,
          uid: req.user.id,
          value: req.body.value
        })
        return r.save(null, {transacting: t})
      })
      .then(fback => {
        t.commit()
        fback = Object.assign({proposal: req.fetched.toJSON()}, fback.toJSON())
        res.status(201).json(fback)
        next()
      })
      .catch(t.rollback)
    })
    .catch(next)
  }
  api.post('/:id/feedbacks', g.authMW, MW.fetch, _beforeCreate, _create)

  // --------------------------------------------------------------------------

  function _loadProposalFeedback (req, res, next) {
    new g.models.ProposalFeedback({uid: req.user.id, proposalid: req.params.id}).fetch()
    .then((feedback) => {
      res.json(feedback)
    })
    .catch(next)
  }
  api.get('/:id/feedbacks', g.authMW, _loadProposalFeedback)

  // --------------------------------------------------------------------------

  function _beforeRelDelete (req, res, next) {
    if (req.fetched.status === 'voting') {
      return next(g.createError('too late'))
    }
    req.query = {uid: req.user.id}  // delete mine feedback
    req.params.relation = 'feedbacks' // tell which relation to use
    next()
  }
  api.delete('/:id/feedbacks',
    g.authMW, MW.fetch, _beforeRelDelete, MW.fetch_rel, MW.delete_rel)
}
