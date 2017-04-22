const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const expressJwt = require('express-jwt')
const db = require('./db')

// create app
module.exports = app = express()

// init CORS
opts = {
  maxAge: 86400,
  origin: process.env.ALLOWED_ORIGIN || /pirati\.cz$/
}
app.use(cors(opts))

jwtOpts = {
  secret: process.env.SERVER_SECRET
}
app.use(expressJwt(jwtOpts))  //

app.use(bodyParser.json())  // JSON body parser for parsing incoming data

// setup api
function _createError(message, status) {
  return Error({status, message})
}
let api = express()
require('./lib/proposals')(api, db.models.Proposal, _createError)
app.use('/proposals', api)

api = express()
require('./lib/comments')(api, db.models.Comment, _createError)
app.use('/comments', api)

api = express()
require('./lib/votings')(api, db.models.Voting, _createError)
app.use('/votings', api)


function _general_error_handler(err, req, res, next) {
  res.status(err.status || 400).send(err.message || err)
  if (process.env.NODE_ENV !== 'production') {
    console.log('---------------------------------------------------------')
    console.log(err)
    console.log('---------------------------------------------------------')
  }
}
app.use(_general_error_handler)
