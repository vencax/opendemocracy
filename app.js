const express = require('express')
const bodyParser = require('body-parser')
const expressJwt = require('express-jwt')
const db = require('./db')
const fakeusers = require('./fakeusers')

module.exports = (app, sendMail) => {
  // JSON body parser for parsing incoming data
  app.use(bodyParser.json())

  // setup api
  function _createError (message, status) {
    return {status: status || 400, message}
  }

  const g = {
    authMW: expressJwt({secret: process.env.SERVER_SECRET}),
    createError: _createError,
    models: db.models,
    startTransaction: db.startTransaction,
    getUserGroups: (user) => user.groups || []
  }

  fakeusers(app, g)  // init auth routes

  const notifications = require('./lib/notifications')(db)
  const mailer = require('./lib/mailer')
  const AuthService = require('./lib/auth_service')
  const oldNotifAdd = notifications.add
  function addNotif (evt, objid, title, group = null, trns = null) {
    let notification
    return oldNotifAdd(evt, objid, title, group, trns)
    .then(notif => {
      notification = notif.toJSON()
      return AuthService.groupMembers(notification.group)
    })
    .then(recipients => {
      mailer(sendMail, notification, recipients)
    })
    .catch(err => console.log(err))
  }
  notifications.add = addNotif
  const manager = require('./lib/manager')(db, notifications)

  let api = express()
  require('./lib/proposals')(api, g, manager)
  app.use('/proposals', api)

  api = express()
  require('./lib/comments')(api, g)
  app.use('/comments', api)

  api = express()
  notifications.initApi(api, g)
  app.use('/notifications', api)

  function _generalErrorHandler (err, req, res, next) {
    res.status(err.status || 400).send(err.message || err)
    if (process.env.NODE_ENV !== 'production') {
      console.log('---------------------------------------------------------')
      console.log(err)
      console.log('---------------------------------------------------------')
    }
  }
  app.use(_generalErrorHandler)
  return app
}
