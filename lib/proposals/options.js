
module.exports = function (api, MW, g) {
  //
  function _checkDraft (req, res, next) {
    if (req.fetched.get('status') !== 'draft') {
      return next(g.createError('not in draft mode anymore :('))
    }
    next()
  }

  function _beforeCreate (req, res, next) {
    req.params.relation = 'options'   // tell which relation to use
    next()
  }
  api.post('/:id/options', g.authMW, MW.fetch, _checkDraft, _beforeCreate, MW.create_rel)

  // --------------------------------------------------------------------------

  function _beforeUpdate (req, res, next) {
    if (req.fetched.get('uid') !== req.user.id) {
      return next(g.createError('not mine'))
    }
    req.query = {id: req.params.oid}
    req.params.relation = 'options' // tell which relation to use
    next()
  }
  api.put('/:id/options/:oid',
    g.authMW, MW.fetch, _checkDraft, _beforeUpdate, MW.fetch_rel, MW.update_rel)

  // --------------------------------------------------------------------------

  function _beforeDelete (req, res, next) {
    if (req.fetched.get('uid') !== req.user.id) {
      return next(g.createError('not mine'))
    }
    req.query = {id: req.params.oid}  // delete mine feedback
    req.params.relation = 'options' // tell which relation to use
    next()
  }
  api.delete('/:id/options/:oid',
    g.authMW, MW.fetch, _checkDraft, _beforeDelete, MW.fetch_rel, MW.delete_rel)
}
