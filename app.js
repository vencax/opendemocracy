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

fakeusers(app)  // init auth routes
// auth
app.use(expressJwt({
  secret: process.env.SERVER_SECRET
}))

// setup api
function _createError (message, status) {
  return {status: status || 400, message}
}

const manager = require('./lib/manager')(db)

let api = express()
require('./lib/proposals')(api, db.models, _createError, db.startTransaction, manager)
app.use('/proposals', api)

api = express()
require('./lib/comments')(api, db.models, _createError, db.startTransaction)
app.use('/comments', api)

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
