
module.exports = function (api, MW, Reply, createError, startTransaction) {
  //
  function _beforeList (req, res, next) {
    req.params.relation = 'replies'   // tell which relation to use
    next()
  }
  api.get('/:id/replies', MW.fetch, _beforeList, MW.fetch_rel, MW.get_rel)

  // --------------------------------------------------------------------------

  function _create (req, res, next) {
    req.body = {
      content: req.body.content,
      uid: req.user.id,
      commentid: req.params.id
    }  // leave only content

    startTransaction(t => {
      // increment reply_count on fetched
      const saveOpts = {patch: true, transacting: t}
      req.fetched.save({reply_count: req.fetched.get('reply_count') + 1}, saveOpts)
      .then(() => {
        // save reply
        const r = new Reply(req.body)
        return r.save(null, {transacting: t})
      })
      .then(reply => {
        t.commit()
        res.status(201).json(reply)
        next()
      })
      .catch(t.rollback)
    })
    .catch(next)
  }
  api.post('/:id/replies', MW.fetch, _create)

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
