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
    return next()
  }

  function _before_relation_delete(req, res, next) {
    req.query = {
      uid: req.user.id
    }
    return next()
  }

  api.get('/:parentid', Mwarez.list_query, Mwarez.load_query, Mwarez.list_middleware)
  api.get('/:id', Mwarez.fetch_middleware, Mwarez.detail_middleware)
  api.post('/', _checkProposalPresence, _addAuthor, Mwarez.create_middleware)
  api.put('/:id', Mwarez.fetch_middleware, _checkUpdate, Mwarez.update_middleware)
  api.post('/:id/:relation', Mwarez.fetch_middleware, _addAuthor, Mwarez.create_relation_middleware)
  api.put('/:id/:relation', Mwarez.fetch_middleware, _addAuthor, Mwarez.create_relation_middleware)
  api.delete('/:id/:relation', Mwarez.fetch_middleware, _addAuthor, Mwarez.delete_relation_middleware)
}
