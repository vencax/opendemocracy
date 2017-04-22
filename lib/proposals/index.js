const kalamata = require('kalamata')
const feedbacks = require('./feedbacks')

module.exports = function(api, Proposal, createError) {

  const MW = kalamata(Proposal, {createError: createError})

  feedbacks(api, MW, createError)   // setup feedback routes

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

}
