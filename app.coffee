express = require('express')
bodyParser = require('body-parser')
cors = require('cors')
expressJwt = require('express-jwt')
db = require('./db')

# create app
module.exports = app = express()

# init CORS
opts =
  maxAge: 86400
  origin: process.env.ALLOWED_ORIGIN || /pirati\.cz$/
app.use(cors(opts))

jwtOpts =
  secret: process.env.SERVER_SECRET
app.use(expressJwt(jwtOpts))

# use JSON body parser for parsing incoming data
app.use(bodyParser.json())

# setup api
api = express()
require('./lib/proposals')(api, db.models.Proposal)
app.use('/proposals', api)

api = express()
require('./lib/comments')(api, db.models.Comment)
app.use('/comments', api)


app.use (err, req, res, next) ->
  console.log err
  res.status(400).send(err)
