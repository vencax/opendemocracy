
module.exports = function (api, MW, Proposal, Option, createError) {
  //
  function _checkContent (req, res, next) {
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

  function _checkVotable (req, res, next) {
    if (req.fetched.get('status') !== 'voting') {
      return next(createError('not votable'))
    }
    const now = new Date()
    if (new Date(req.fetched.get('votingbegins')) > now) {
      return next(createError('too early'))
    }
    if (new Date(req.fetched.get('votingends')) < now) {
      return next(createError('too late'))
    }
    next()
  }
  // --------------------------------------------------------------------------

  function _beforeCreate (req, res, next) {
    req.params.relation = 'casts'
    req.body = {
      uid: req.user.id,
      content: req.body.content
    }
    next()
  }
  api.post('/:id/casts',
    MW.fetch, _checkVotable, _checkContent, _beforeCreate, MW.create_rel)

  // --------------------------------------------------------------------------

  function _beforeUpdate (req, res, next) {
    req.params.relation = 'casts'
    req.query = {uid: req.user.id}
    req.body = {content: req.body.content}   // leave only checked content
    next()
  }
  api.put('/:id/casts',
    MW.fetch, _checkVotable, _checkContent, _beforeUpdate, MW.fetch_rel, MW.update_rel)

  // --------------------------------------------------------------------------

  function _beforeDelete (req, res, next) {
    req.query = {uid: req.user.id}  // delete mine
    req.params.relation = 'casts' // tell which relation to use
    next()
  }
  api.delete('/:id/casts',
    MW.fetch, _checkVotable, _beforeDelete, MW.fetch_rel, MW.delete_rel)
}