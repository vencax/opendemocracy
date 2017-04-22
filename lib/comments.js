const kalamata = require('kalamata')


module.exports = function(api, Comment, createError) {

  const MW = kalamata(Comment, {createError: createError})

  function _before_list(req, res, next) {
    req.query.parent = req.params.parentid  // limit results to given proposal
    next()
  }
  api.get('/:parentid', _before_list, MW.load_q, MW.list)

  // --------------------------------------------------------------------------

  function _checkProposalPresence(req, res, next) {
    if (req.body.parent === undefined) {
      return next(createError('missing parent'))
    }
    relation = new Comment({parent: req.body.parent}).related('proposal')
    return relation.fetch({require: true}).then(function(proposal) {
      req.proposal = proposal
      return next()
    })
    .catch(next)
  }
  function _addAuthor(req, res, next) {
    req.body.uid = req.user.id
    return next()
  }
  api.post('/', _checkProposalPresence, _addAuthor, MW.create)

  // --------------------------------------------------------------------------

  function _checkUpdate(req, res, next) {
    if (req.user.id !== req.fetched.get('uid')) {
      return next(createError('not mine'))
    }
    delete req.body.parent  // parent must not be changed
    delete req.body.uid     // nor the uid
    return next()
  }
  api.put('/:id', MW.fetch, _checkUpdate, MW.update)

  // --------------------------------------------------------------------------

  api.get('/:id/:relation', MW.fetch, MW.create_rel)

  // --------------------------------------------------------------------------

  function _loadOpositeFB(req, res, next, val) {
    const relation = req.fetched.related(req.params.relation)
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
  function _before_relation_create(req, res, next) {
    switch(req.params.relation) {
      case 'replies':
        req.body = {content: req.body.content}  // leave only content
        return next()
      case 'feedbacks':
        const val = parseInt(req.body.value)
        if (isNaN(val) || !(val === 1 || val === -1)) {
          return next(createError('wrong value, must be either 1 or -1'))
        }
        req.body = {uid: req.user.id, value: req.body.value}  // leave only content and add uid
        return _loadOpositeFB(req, res, next, val)
      default:
        return next(createError('no such relation', 404))
    }
  }
  api.post('/:id/:relation', MW.fetch, _before_relation_create, _addAuthor, MW.create_rel)

  // --------------------------------------------------------------------------

  function _before_rel_update(req, res, next) {
    switch(req.params.relation) {
      case 'replies':
        req.body = {content: req.body.content}  // leave only content
        req.query = {id: req.params.relid, uid: req.user.id}
        break
      case 'feedbacks':
        return next(createError('not possible', 404))
    }
    return next()
  }
  api.put('/:id/:relation/:relid',
    MW.fetch,  // load proposal
    _before_rel_update,  // check req.body
    MW.fetch_rel,
    MW.update_rel
  )

  // --------------------------------------------------------------------------

  function _before_rel_delete(req, res, next) {
    switch(req.params.relation) {
      case 'feedbacks':
        req.query = {uid: req.user.id} // delete our FB
        return next()
      default:
        return next(createError('no such relation', 404))
    }
  }
  api.delete('/:id/:relation',
    MW.fetch, _before_rel_delete, MW.fetch_rel, MW.delete_rel)
}
