const kalamata = require('kalamata')

module.exports = function(api, Voting, Option, createError) {

  const MW = kalamata(Voting, {createError: createError})

  api.get('/', MW.load_q, MW.list)
  api.get('/:id', MW.fetch, MW.detail)

  function _check_content(req, res, next) {
    const votedOptIds = req.body.content.toString().split(',')
    Option.query('where', 'id', 'in', votedOptIds).fetchAll()
    .then((found) => {
      // TODO: if (found.length > maxselopts)
      if (found.length !== votedOptIds.length) {
        return next(createError('wrong content (options)'))
      }
      next()
    })
    .catch(next)
  }

  function _check_votable(req, res, next) {
    const now = new Date()
    if (new Date(req.fetched.get('begins')) > now) {
      return next(createError('too early'))
    }
    if (new Date(req.fetched.get('ends')) < now) {
      return next(createError('too late'))
    }
    next()
  }
  // --------------------------------------------------------------------------

  function _before_create(req, res, next) {
    req.params.relation = 'casts'
    req.body = {
      uid: req.user.id,
      content: req.body.content
    }
    next()
  }
  api.post('/:id/casts',
    MW.fetch, _check_votable, _check_content, _before_create, MW.create_rel)

  // --------------------------------------------------------------------------

  function _before_update(req, res, next) {
    req.params.relation = 'casts'
    req.query = {uid: req.user.id}
    req.body = {content: req.body.content}   // leave only checked content
    next()
  }
  api.put('/:id/casts',
    MW.fetch, _check_votable, _check_content, _before_update, MW.fetch_rel, MW.update_rel)

  // --------------------------------------------------------------------------

  function _before_delete(req, res, next) {
    req.query = {uid: req.user.id}  // delete mine
    req.params.relation = 'casts' // tell which relation to use
    next()
  }
  api.delete('/:id/casts',
    MW.fetch, _check_votable, _before_delete, MW.fetch_rel, MW.delete_rel)

}
