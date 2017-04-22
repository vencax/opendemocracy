const kalamata = require('kalamata')

module.exports = function(api, MW, createError) {

  function _check_draft(req, res, next) {
    if (req.fetched.get('status') !== 'draft') {
      return next(createError('not in draft mode anymore :('))
    }
    next()
  }

  function _beforecreate(req, res, next) {
    req.params.relation = 'options'   // tell which relation to use
    next()
  }
  api.post('/:id/options', MW.fetch, _check_draft, _beforecreate, MW.create_rel)

  // --------------------------------------------------------------------------

  function _before_update(req, res, next) {
    if (req.fetched.get('uid') !== req.user.id) {
      return next(createError('not mine'))
    }
    req.query = {id: req.params.oid}
    req.params.relation = 'options' // tell which relation to use
    next()
  }
  api.put('/:id/options/:oid',
    MW.fetch, _check_draft, _before_update, MW.fetch_rel, MW.update_rel)

  // --------------------------------------------------------------------------

  function _before_delete(req, res, next) {
    if (req.fetched.get('uid') !== req.user.id) {
      return next(createError('not mine'))
    }
    req.query = {id: req.params.oid}  // delete mine feedback
    req.params.relation = 'options' // tell which relation to use
    next()
  }
  api.delete('/:id/options/:oid',
    MW.fetch, _check_draft, _before_delete, MW.fetch_rel, MW.delete_rel)

}
