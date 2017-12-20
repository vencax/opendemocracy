
exports.initApi = function (api, g) {
  api.get('/', g.authMW, (req, res, next) => {
    const ids = g.models.SeenNotification.query()
      .where({uid: req.user.id}).select('notificationid')
    g.models.Notification.query((qb) => {
      qb.whereNotIn('id', ids)
    }).fetchAll()
    .then(found => {
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

exports.add = (evt, objid, title, db, trns) => {
  const n = new db.models.Notification({evt, objid, title})
  return n.save(null, {transacting: trns})
}
