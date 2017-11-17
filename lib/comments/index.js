const kalamata = require('kalamata')
const replies = require('./replies')
const commentfeedbacks = require('./commentfeedbacks')

module.exports = function (api, g) {
  const MW = kalamata(g.models.Comment, {createError: g.createError})

  replies(api, MW, g)   // setup replies routes
  commentfeedbacks(api, g)   // setup commentfeedbacks routes

  // --------------------------------------------------------------------------

  function _beforeList (req, res, next) {
    req.query.parent = req.params.parentid  // limit results to given proposal
    next()
  }
  api.get('/:parentid', _beforeList, MW.paging_q, MW.load_q, MW.list)

  // --------------------------------------------------------------------------

  function _checkProposalPresence (req, res, next) {
    if (req.body.parent === undefined) {
      return next(g.createError('missing parent'))
    }
    const relation = new g.models.Comment({parent: req.body.parent}).related('proposal')
    return relation.fetch({require: true}).then(function (proposal) {
      req.proposal = proposal
      return next()
    })
    .catch(next)
  }
  function _create (req, res, next) {
    req.body.uid = req.user.id
    g.startTransaction(t => {
      // increment comment_count on fetched
      const saveOpts = {patch: true, transacting: t}
      req.proposal.save({comment_count: req.proposal.get('comment_count') + 1}, saveOpts)
      .then(() => {
        // save comment
        const r = new g.models.Comment(req.body)
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
  api.post('/', g.authMW, _checkProposalPresence, _create)

  // --------------------------------------------------------------------------

  function _checkUpdate (req, res, next) {
    if (req.user.id !== req.fetched.get('uid')) {
      return next(g.createError('not mine'))
    }
    delete req.body.parent  // parent must not be changed
    delete req.body.uid     // nor the uid
    return next()
  }
  api.put('/:id', g.authMW, MW.fetch, _checkUpdate, MW.update)
}
