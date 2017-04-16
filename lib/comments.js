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

  function _before_relation_create(req, res, next) {
    switch(req.params.relation) {
      case 'replies':
        req.body = {content: req.body.content}  // leave only content
        break
    }
    return next()
  }

  function _before_relation_delete(req, res, next) {
    switch(req.params.relation) {
      case 'replies':
        return next({status: 404, message: 'not possible'})
    }
  }

  function _before_relation_update(req, res, next) {
    switch(req.params.relation) {
      case 'replies':
        req.body = {content: req.body.content}  // leave only content
        req.query = {id: req.params.relid, uid: req.user.id}
        break
    }
    return next()
  }

  api.get('/:parentid', Mwarez.list_query, Mwarez.load_query, Mwarez.list_middleware)
  api.get('/:id', Mwarez.fetch_middleware, Mwarez.detail_middleware)
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
  api.delete('/:id/:relation', Mwarez.fetch_middleware, _before_relation_delete, Mwarez.delete_relation_middleware)
}
