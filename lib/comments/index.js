const kalamata = require('kalamata')
const replies = require('./replies')
const commentfeedbacks = require('./commentfeedbacks')

module.exports = function (api, models, createError, startTransaction) {
  const MW = kalamata(models.Comment, {createError: createError})

  replies(api, MW, models.Reply, createError, startTransaction)   // setup replies routes
  commentfeedbacks(api, models.Comment, models.CommentFeedback, createError, startTransaction)   // setup commentfeedbacks routes

  // --------------------------------------------------------------------------

  function _beforeList (req, res, next) {
    req.query.parent = req.params.parentid  // limit results to given proposal
    next()
  }
  api.get('/:parentid', _beforeList, MW.paging_q, MW.load_q, MW.list)

  // --------------------------------------------------------------------------

  function _checkProposalPresence (req, res, next) {
    if (req.body.parent === undefined) {
      return next(createError('missing parent'))
    }
    const relation = new models.Comment({parent: req.body.parent}).related('proposal')
    return relation.fetch({require: true}).then(function (proposal) {
      req.proposal = proposal
      return next()
    })
    .catch(next)
  }
  function _create (req, res, next) {
    req.body.uid = req.user.id
    startTransaction(t => {
      // increment comment_count on fetched
      const saveOpts = {patch: true, transacting: t}
      req.proposal.save({comment_count: req.proposal.get('comment_count') + 1}, saveOpts)
      .then(() => {
        // save comment
        const r = new models.Comment(req.body)
        return r.save(null, {transacting: t})
      })
      .then(newitem => {
        return newitem.refresh({transacting: t})
      })
      .then(newitem => {
        t.commit()
        res.status(201).json(newitem)
        next()
      })
      .catch(t.rollback)
    })
    .catch(next)
  }
  api.post('/', _checkProposalPresence, _create)

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
