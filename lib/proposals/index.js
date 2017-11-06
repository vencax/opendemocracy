const kalamata = require('kalamata')
const feedbacks = require('./feedbacks')
const options = require('./options')

module.exports = function (api, models, createError, startTransaction, manager) {
  //
  const MW = kalamata(models.Proposal, {createError: createError})

  feedbacks(api, MW, models.ProposalFeedback, createError, startTransaction, manager)   // setup feedback routes
  options(api, MW, createError)

  api.get('/', MW.paging_q, MW.load_q, MW.list)
  api.get('/:id', MW.load_q, MW.fetch, MW.detail)

  // --------------------------------------------------------------------------

  function _beforeCreate (req, res, next) {
    req.body.uid = req.user.id
    req.body.status = 'draft'
    next()
  }
  api.post('/', _beforeCreate, MW.create)

  // --------------------------------------------------------------------------

  function _beforeUpdate (req, res, next) {
    if (req.user.id !== req.fetched.get('uid')) {
      return next(createError('not mine'))
    }
    next()
  }
  api.put('/:id', MW.fetch, _beforeUpdate, MW.update)
  api.put('/:id/publish', MW.fetch, (req, res, next) => {
    if (req.user.id !== req.fetched.get('uid')) {
      return next(createError('not mine'))
    }
    req.fetched.save({status: 'discussing'}, {patch: true}).then(() => {
      res.json({message: 'ok'})
      next()
    }).catch(next)
  })

  // --------------------------------------------------------------------------

  function _beforeDelete (req, res, next) {
    if (req.user.id !== req.fetched.get('uid')) {
      return next(createError('not mine'))
    }
    if (req.fetched.get('status') !== 'draft') {
      return next(createError('cannot delete non draft proposal'))
    }
    next()
  }
  api.delete('/:id', MW.fetch, _beforeDelete, MW.delete)
}
