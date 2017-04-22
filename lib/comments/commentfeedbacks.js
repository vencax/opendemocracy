
module.exports = function(api, MW, createError) {

  function _loadOpositeFB(req, res, next, val) {
    const relation = req.fetched.related('feedbacks')
    const oposite = val * -1
    relation.query({where: {uid: req.body.uid, value: oposite}}).fetch()
    .then(function(fetched) {
      if (fetched.length > 0) {
        return fetched.invokeThen('destroy')
      }
    })
    .then(function(destroyed) {
      if (destroyed) {
        return res.status(201).json(destroyed)
      } else {
        return next() // save da FB it does not yet exist
      }
    })
    .catch(next)
  }
  function _before_create(req, res, next) {
    const val = parseInt(req.body.value)
    if (isNaN(val) || !(val === 1 || val === -1)) {
      return next(createError('wrong value, must be either 1 or -1'))
    }
    req.body = {uid: req.user.id, value: req.body.value}  // leave only content and add uid
    req.body.uid = req.user.id    // addAuthor
    req.params.relation = 'feedbacks'   // tell which relation to use
    return _loadOpositeFB(req, res, next, val)
  }
  api.post('/:id/feedbacks', MW.fetch, _before_create, MW.create_rel)

  // --------------------------------------------------------------------------

  function _before_del(req, res, next) {
    req.query = {uid: req.user.id} // delete our FB
    req.params.relation = 'feedbacks'   // tell which relation to use
    return next()
  }
  api.delete('/:id/feedbacks',
    MW.fetch, _before_del, MW.fetch_rel, MW.delete_rel)
}
