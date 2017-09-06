fs = require('fs')
jwt = require('jsonwebtoken')
express = require('express')
chai = require('chai')
chaiHttp = require('chai-http')
chai.use(chaiHttp)
should = chai.should()

process.env.SERVER_SECRET = 'fhdsakjhfkjal'
process.env.NODE_ENV = 'test'
# process.env.DATABASE_URL = 'sqlite://db.sqlite'
port = process.env.PORT || 3333
g = {}

describe 'app', ->

  g.app = app = require('../app')
  g.loggedUser =
    id: 111
    username: 'gandalf'
    email: 'gandalf@shire.nz'
  g.loggedUser2 =
    id: 11
    username: 'saruman'
    email: 'saruman@mordor.cz'
  g.baseurl = "http://localhost:#{port}"

  before (done) ->
    this.timeout(5000)
    db = require('../db')
    g.db = db
    db.migrate.rollback()
    .then ()->
      return db.migrate.latest()
    .then ()->
      # init server
      g.server = app.listen port, (err) ->
        return done(err) if err
        done()
    .catch(done)
    return

  after (done) ->
    g.server.close()
    done()

  it 'should exist', (done) ->
    should.exist g.app
    done()

  describe 'API', ->

    before () ->
      r = chai.request(g.baseurl)
      return r.post('/login').send(g.loggedUser)
      .then (res)->
        res.should.have.status(200)
        g.token = res.body.token
        g.authHeader = "Bearer #{g.token}"
        r.post('/login').send(g.loggedUser2)
      .then (res)->
        res.should.have.status(200)
        g.token2 = res.body.token
        g.authHeader2 = "Bearer #{g.token2}"

    # run the rest of tests
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
