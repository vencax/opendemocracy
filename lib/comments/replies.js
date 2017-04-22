
module.exports = function(api, MW, createError) {

  function _before_list(req, res, next) {
    req.params.relation = 'replies'   // tell which relation to use
    next()
  }
  api.get('/:id/replies', MW.fetch, _before_list, MW.fetch_rel, MW.get_rel)

  // --------------------------------------------------------------------------

  function _before_create(req, res, next) {
    req.body = {content: req.body.content}  // leave only content
    req.body.uid = req.user.id
    req.params.relation = 'replies'   // tell which relation to use
    next()
  }
  api.post('/:id/replies', MW.fetch, _before_create, MW.create_rel)

  // --------------------------------------------------------------------------

  function _before_update(req, res, next) {
    req.body = {content: req.body.content}  // leave only content
    req.query = {id: req.params.relid, uid: req.user.id}
    req.params.relation = 'replies'   // tell which relation to use
    next()
  }
  api.put('/:id/:relation/:relid',
    MW.fetch, _before_update, MW.fetch_rel, MW.update_rel)

}
