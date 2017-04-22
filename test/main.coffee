fs = require('fs')
jwt = require('jsonwebtoken')
express = require('express')
chai = require('chai')
chaiHttp = require('chai-http')
chai.use(chaiHttp)
should = chai.should()

process.env.SERVER_SECRET = 'fhdsakjhfkjal'
# process.env.DATABASE_URL = 'sqlite://db.sqlite'
port = process.env.PORT || 3333
g = {}

describe 'app', ->

  g.app = app = require('../app')
  g.loggedUser =
    id: 111
    username: 'gandalf'
  g.loggedUser2 =
    id: 11
    username: 'saruman'
  g.token = jwt.sign(g.loggedUser, process.env.SERVER_SECRET)
  g.token2 = jwt.sign(g.loggedUser2, process.env.SERVER_SECRET)
  g.authHeader = "Bearer #{g.token}"
  g.authHeader2 = "Bearer #{g.token2}"


  before (done) ->
    this.timeout(5000)
    db = require('../db')
    g.db = db
    db.migrate.rollback().then ()->
      return db.migrate.latest()
    .then ()->
      # init server
      g.server = app.listen port, (err) ->
        return done(err) if err
        done()
      return
    .catch(done)
    return

  after (done) ->
    g.server.close()
    done()

  it 'should exist', (done) ->
    should.exist g.app
    done()

  # run the rest of tests
  g.baseurl = "http://localhost:#{port}"

  submodules = [
    './proposals'
    './proposalfeedbacks'
    './proposaloptions'
    './comments'
    './replies'
    './commentfeedbacks'
    './votings'
  ]
  for i in submodules
    SubMod = require(i)
    SubMod(g)
