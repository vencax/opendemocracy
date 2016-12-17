express = require('express')
bodyParser = require('body-parser')
cors = require('cors')
expressJwt = require('express-jwt')
kalamata = require('kalamata')
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
api = kalamata(app)
require('./lib/proposals')(api, db.models.Proposal)
require('./lib/proposalfeedbacks')(api, db.models.ProposalFeedback)
require('./lib/comments')(api, db.models.Comment)
require('./lib/commentfeedbacks')(api, db.models.CommentFeedback)
require('./lib/replies')(api, db.models.Reply)

# app.use (err, req, res, next) ->
#   console.log err
#   res.status(400).send(err)
