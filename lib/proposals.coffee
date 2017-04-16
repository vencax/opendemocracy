kalamata = require('kalamata')

module.exports = (api, Proposal) ->

  Mwarez = kalamata(Proposal)

  _beforeCreate = (req, res, next) ->
    req.body.author = req.user.id
    req.body.status = 'draft'
    next()

  _beforeUpdate = (req, res, next) ->
    if(req.user.id != req.fetched.get('author'))
      return next(status: 400, message: 'not mine')
    next()

  _beforeDelete = (req, res, next) ->
    if(req.user.id != req.fetched.get('author'))
      return next(status: 400, message: 'not mine')
    if(req.fetched.get('status') != 'draft')
      return next(status: 400, message: 'cannot delete non draft proposal')
    next()

  _before_relation_create = (req, res, next) ->
    value = parseInt(req.body.value)
    if isNaN(value) or value != 1
      return next(status: 400, message: 'wrong value, must be 1')
    req.body.uid = req.user.id
    next()

  api.get('/', Mwarez.list_query, Mwarez.load_query, Mwarez.list_middleware)
  api.get('/:id', Mwarez.fetch_middleware, Mwarez.detail_middleware)
  api.post('/', _beforeCreate, Mwarez.create_middleware)
  api.put('/:id', Mwarez.fetch_middleware, _beforeUpdate, Mwarez.update_middleware)
  api.delete('/:id', Mwarez.fetch_middleware, _beforeDelete, Mwarez.delete_middleware)
  api.post('/:id/:relation', Mwarez.fetch_middleware, _before_relation_create, Mwarez.create_relation_middleware)

  _before_relation_delete = (req, res, next) ->
    req.query =
      uid: req.user.id
    next()

  api.delete('/:id/:relation',
    Mwarez.fetch_middleware,
    _before_relation_delete,
    Mwarez.load_related_middleware,
    Mwarez.delete_relation_middleware
  )
