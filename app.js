const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const expressJwt = require('express-jwt')
const db = require('./db')
const fakeusers = require('./fakeusers')

// create app
const app = express()

// init CORS
const opts = {
  maxAge: 86400,
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['DELETE', 'PUT', 'POST', 'OPTIONS', 'GET'],
  exposedHeaders: ['x-total-count']
}
app.use(cors(opts))
app.use(bodyParser.json())  // JSON body parser for parsing incoming data

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

const manager = require('./lib/manager')(db)

let api = express()
require('./lib/proposals')(api, g, manager)
app.use('/proposals', api)

api = express()
require('./lib/comments')(api, g)
app.use('/comments', api)

api = express()
require('./lib/notifications').initApi(api, g)
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

module.exports = app
