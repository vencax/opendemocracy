const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const expressJwt = require('express-jwt')
const db = require('./db')

// create app
const app = express()

// init CORS
const opts = {
  maxAge: 86400,
  origin: process.env.ALLOWED_ORIGIN || /pirati\.cz$/
}
app.use(cors(opts))

const jwtOpts = {
  secret: process.env.SERVER_SECRET
}
app.use(expressJwt(jwtOpts))  //

app.use(bodyParser.json())  // JSON body parser for parsing incoming data

// setup api
function _createError (message, status) {
  return {status: status || 400, message}
}
let api = express()
require('./lib/proposals')(api, db.models.Proposal, _createError)
app.use('/proposals', api)

api = express()
require('./lib/comments')(api, db.models.Comment, _createError)
app.use('/comments', api)

api = express()
require('./lib/votings')(api, db.models.Voting, db.models.Option, _createError)
app.use('/votings', api)

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
