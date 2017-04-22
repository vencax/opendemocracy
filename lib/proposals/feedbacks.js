const kalamata = require('kalamata')

module.exports = function(api, MW, createError) {

  function _before_rel_create(req, res, next) {
    const value = parseInt(req.body.value)
    if (isNaN(value) || value !== 1) {
      return next(createError('wrong value, must be 1'))
    }
    req.body.uid = req.user.id  // set user as well
    req.params.relation = 'feedbacks'   // tell which relation to use
    next()
  }
  api.post('/:id/feedbacks', MW.fetch, _before_rel_create, MW.create_rel)

  // --------------------------------------------------------------------------

  function _before_rel_delete(req, res, next) {
    req.query = {uid: req.user.id}  // delete mine feedback
    req.params.relation = 'feedbacks' // tell which relation to use
    next()
  }
  api.delete('/:id/feedbacks',
    MW.fetch, _before_rel_delete, MW.fetch_rel, MW.delete_rel)

}
