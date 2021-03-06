
module.exports = (db) => {
  //
  function initApi (api, g) {
    //
    function _isGroupMember (user, group) {
      return (!group) ? true : g.getUserGroups(user).indexOf(group) >= 0
    }

    api.get('/', g.authMW, (req, res, next) => {
      const ids = g.models.SeenNotification.query()
        .where({uid: req.user.id}).select('notificationid')
      g.models.Notification.query((qb) => {
        qb.whereNotIn('id', ids)
      }).fetchAll()
      .then(found => {
        found = found.filter(i => _isGroupMember(req.user, i.group))
        res.json(found)
      })
      .catch(next)
    })
    api.post('/:id', g.authMW, (req, res, next) => {
      const n = new g.models.SeenNotification({
        uid: req.user.id,
        notificationid: req.params.id
      })
      n.save()
      .then(saved => {
        res.json(saved)
      })
      .catch(next)
    })
  }

  function add (evt, objid, title, group = null, trns = null) {
    const n = new db.models.Notification({evt, objid, title})
    return n.save(null, {transacting: trns})
  }

  return {initApi, add}
}
