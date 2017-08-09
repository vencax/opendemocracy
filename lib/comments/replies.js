
module.exports = function (api, MW, createError) {
  //
  function _beforeList (req, res, next) {
    req.params.relation = 'replies'   // tell which relation to use
    next()
  }
  api.get('/:id/replies', MW.fetch, _beforeList, MW.fetch_rel, MW.get_rel)

  // --------------------------------------------------------------------------

  function _beforeCreate (req, res, next) {
    req.body = {content: req.body.content}  // leave only content
    req.body.uid = req.user.id
    req.params.relation = 'replies'   // tell which relation to use
    next()
  }
  api.post('/:id/replies', MW.fetch, _beforeCreate, MW.create_rel)

  // --------------------------------------------------------------------------

  function _beforeUpdate (req, res, next) {
    req.body = {content: req.body.content}  // leave only content
    req.query = {id: req.params.relid, uid: req.user.id}
    req.params.relation = 'replies'   // tell which relation to use
    next()
  }
  api.put('/:id/:relation/:relid',
    MW.fetch, _beforeUpdate, MW.fetch_rel, MW.update_rel)
}
