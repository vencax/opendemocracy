const kalamata = require('kalamata')


module.exports = function(api, Comment) {

  const Mwarez = kalamata(Comment)

  function _checkProposalPresence(req, res, next) {
    if (req.body.parent === undefined) {
      return next({status: 400, message: 'missing parent'})
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

  function _checkUpdate(req, res, next) {
    if (req.user.id !== req.fetched.get('uid')) {
      return next({status: 400, message: 'not mine'})
    }
    delete req.body.parent  // parent must not be changed
    delete req.body.uid     // nor the uid
    return next()
  }

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
          return next({status: 400, message: 'wrong value, must be either 1 or -1'})
        }
        req.body = {uid: req.user.id, value: req.body.value}  // leave only content and add uid
        return _loadOpositeFB(req, res, next, val)
      default:
        return next({status: 404, message: 'no such relation'})
    }
  }

  function _before_relation_delete(req, res, next) {
    switch(req.params.relation) {
      case 'feedbacks':
        req.query = {uid: req.user.id} // delete our FB
        return next()
      default:
        return next({status: 404, message: 'no such relation'})
    }
  }

  function _before_relation_update(req, res, next) {
    switch(req.params.relation) {
      case 'replies':
        req.body = {content: req.body.content}  // leave only content
        req.query = {id: req.params.relid, uid: req.user.id}
        break
      case 'feedbacks':
        return next({status: 404, message: 'not possible'})
    }
    return next()
  }

  function _before_list(req, res, next) {
    req.listquery.parent = req.params.parentid  // limit results to given proposal
    next()
  }

  api.get('/:parentid', Mwarez.list_query, _before_list, Mwarez.load_query, Mwarez.list_middleware)
  api.post('/', _checkProposalPresence, _addAuthor, Mwarez.create_middleware)
  api.put('/:id', Mwarez.fetch_middleware, _checkUpdate, Mwarez.update_middleware)
  api.get('/:id/:relation', Mwarez.fetch_middleware, Mwarez.create_relation_middleware)
  api.post('/:id/:relation', Mwarez.fetch_middleware, _before_relation_create, _addAuthor, Mwarez.create_relation_middleware)
  api.put('/:id/:relation/:relid',
    Mwarez.fetch_middleware,  // load proposal
    _before_relation_update,  // check req.body
    Mwarez.load_related_middleware,
    Mwarez.update_relation_middleware
  )
  api.delete('/:id/:relation', Mwarez.fetch_middleware, _before_relation_delete,
    Mwarez.load_related_middleware, Mwarez.delete_relation_middleware)
}
