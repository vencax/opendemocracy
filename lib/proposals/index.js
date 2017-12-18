const kalamata = require('kalamata')
const feedbacks = require('./feedbacks')
const options = require('./options')
const votings = require('./votings/api')

module.exports = function (api, g, manager) {
  //
  const MW = kalamata(g.models.Proposal, {createError: g.createError})

  feedbacks(api, MW, g, manager)   // setup feedback routes
  options(api, MW, g)
  votings(api, MW, g)

  function _loadOnlyOptions (req, res, next) {
    if (req.loadquery && req.loadquery.indexOf('options') >= 0) {
      req.loadquery = ['options']
    }
    next()
  }
  api.get('/', MW.paging_q, MW.load_q, _loadOnlyOptions, MW.list)
  api.get('/:id', MW.load_q, _loadOnlyOptions, MW.fetch, MW.detail)

  // --------------------------------------------------------------------------

  function _beforeCreate (req, res, next) {
    // TODO: vybrat pouze editovatelne polozky
    req.body.uid = req.user.id
    req.body.status = 'draft'
    req.body.laststatuschange = new Date()
    next()
  }
  api.post('/', g.authMW, _beforeCreate, MW.create)

  // --------------------------------------------------------------------------

  function _beforeUpdate (req, res, next) {
    if (req.user.id !== req.fetched.get('uid')) {
      return next(g.createError('not mine'))
    }
    next()
  }
  api.put('/:id', g.authMW, MW.fetch, _beforeUpdate, MW.update)
  api.put('/:id/publish', g.authMW, MW.fetch, (req, res, next) => {
    if (req.user.id !== req.fetched.get('uid')) {
      return next(g.createError('not mine'))
    }
    manager.onProposalPublish(req.fetched).then(() => {
      res.json({message: 'ok'})
      next()
    }).catch(next)
  })

  // --------------------------------------------------------------------------

  function _beforeDelete (req, res, next) {
    if (req.user.id !== req.fetched.get('uid')) {
      return next(g.createError('not mine'))
    }
    if (req.fetched.get('status') !== 'draft') {
      return next(g.createError('cannot delete non draft proposal'))
    }
    next()
  }
  api.delete('/:id', g.authMW, MW.fetch, _beforeDelete, MW.delete)
}
