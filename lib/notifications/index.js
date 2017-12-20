
exports.initApi = function (api, g) {
  api.get('/', (req, res, next) => {
    g.models.Notification.fetchAll()
    .then(found => {
      res.json(found)
    })
    .catch(next)
  })
}

exports.add = (db, evt, objid, title) => {
  return db.models.Notification.create({evt, objid, title})
}
