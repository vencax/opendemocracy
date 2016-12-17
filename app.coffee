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
api.expose(db.models.Proposal)
api.beforeCreateProposal (req, res, proposal) ->
  proposal.set('author', req.user.id)
  proposal.set('status', 'draft')
api.beforeUpdateProposal (req, res, proposal) ->
  if(req.user.id != proposal.get('author'))
    res.status(400).send('not mine')
api.beforeDeleteProposal (req, res, proposal) ->
  if(req.user.id != proposal.get('author'))
    return res.status(400).send('not mine')
  if(proposal.get('status') != 'draft')
    return res.status(400).send('cannot delete non draft proposal')
api.afterDeleteProposal (req, res, proposal) ->
  res.status(200).json({})

api.expose(db.models.ProposalFeedback)
api.expose(db.models.Comment)
api.expose(db.models.CommentFeedback)
api.expose(db.models.Reply)

# app.use (err, req, res, next) ->
#   console.log err
#   res.status(400).send(err)
