const kalamata = require('kalamata')
const replies = require('./replies')
const commentfeedbacks = require('./commentfeedbacks')

module.exports = function (api, Comment, createError) {
  const MW = kalamata(Comment, {createError: createError})

  replies(api, MW, createError)   // setup replies routes
  commentfeedbacks(api, MW, createError)   // setup commentfeedbacks routes

  // --------------------------------------------------------------------------

  function _beforeList (req, res, next) {
    req.query.parent = req.params.parentid  // limit results to given proposal
    next()
  }
  api.get('/:parentid', _beforeList, MW.load_q, MW.list)

  // --------------------------------------------------------------------------

  function _checkProposalPresence (req, res, next) {
    if (req.body.parent === undefined) {
      return next(createError('missing parent'))
    }
    const relation = new Comment({parent: req.body.parent}).related('proposal')
    return relation.fetch({require: true}).then(function (proposal) {
      req.proposal = proposal
      return next()
    })
    .catch(next)
  }
  function _addAuthor (req, res, next) {
    req.body.uid = req.user.id
    return next()
  }
  api.post('/', _checkProposalPresence, _addAuthor, MW.create)

  // --------------------------------------------------------------------------

  function _checkUpdate (req, res, next) {
    if (req.user.id !== req.fetched.get('uid')) {
      return next(createError('not mine'))
    }
    delete req.body.parent  // parent must not be changed
    delete req.body.uid     // nor the uid
    return next()
  }
  api.put('/:id', MW.fetch, _checkUpdate, MW.update)
}
