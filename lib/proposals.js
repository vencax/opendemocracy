const kalamata = require('kalamata')

module.exports = function(api, Proposal, createError) {

  const MW = kalamata(Proposal, {createError: createError})

  api.get('/', MW.load_q, MW.list)
  api.get('/:id', MW.fetch, MW.detail)

  // --------------------------------------------------------------------------

  function _beforeCreate(req, res, next) {
    req.body.author = req.user.id
    req.body.status = 'draft'
    next()
  }
  api.post('/', _beforeCreate, MW.create)

  // --------------------------------------------------------------------------

  function _beforeUpdate(req, res, next) {
    if (req.user.id !== req.fetched.get('author')) {
      return next(createError('not mine'))
    }
    next()
  }
  api.put('/:id', MW.fetch, _beforeUpdate, MW.update)

  // --------------------------------------------------------------------------

  function _beforeDelete(req, res, next) {
    if (req.user.id !== req.fetched.get('author')) {
      return next(createError('not mine'))
    }
    if (req.fetched.get('status') !== 'draft') {
      return next(createError('cannot delete non draft proposal'))
    }
    next()
  }
  api.delete('/:id', MW.fetch, _beforeDelete, MW.delete)

  // --------------------------------------------------------------------------

  function _before_rel_create(req, res, next) {
    const value = parseInt(req.body.value)
    if (isNaN(value) || value !== 1) {
      return next(('wrong value, must be 1'))
    }
    req.body.uid = req.user.id
    next()
  }
  api.post('/:id/:relation',
    MW.fetch, _before_rel_create, MW.create_rel)

  // --------------------------------------------------------------------------

  function _before_rel_delete(req, res, next) {
    req.query = {uid: req.user.id}
    next()
  }
  api.delete('/:id/:relation',
    MW.fetch, _before_rel_delete, MW.fetch_rel, MW.delete_rel)

}
