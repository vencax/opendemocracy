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
let api = express()
require('./lib/proposals')(api, db.models.Proposal)
app.use('/proposals', api)

api = express()
require('./lib/comments')(api, db.models.Comment)
app.use('/comments', api)


function _general_error_handler(err, req, res, next) {
  res.status(400).send(err)
  if (process.env.NODE_ENV !== 'production') {
    console.log('---------------------------------------------------------')
    console.log(err)
    console.log('---------------------------------------------------------')
  }
}
app.use(_general_error_handler)
