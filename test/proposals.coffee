
chai = require('chai')
should = chai.should()
db = require('../db')

module.exports = (g)->

  addr = g.baseurl

  describe 'proposals', ->

    before (done)->
      db.migrate.rollback().then ()->
        return db.migrate.latest()
      .then ()->
        done()
      .catch (err)->
        done(err)

    it 'must NOT create new proposal with missing mandatories', (done) ->
      chai.request(g.baseurl)
      .post('/proposals').set('Authorization', g.authHeader)
      .send({title: 'prop1'})
      .end (err, res) ->
        res.should.have.status(500)
        should.not.exist(res.body.title)
        should.not.exist(res.body.id)
        done()

    it 'shall create a new proposal', (done) ->
      p =
        title: 'prop1'
        body: 'I propose to have a party'
        status: 'draft'
      chai.request(g.baseurl)
      .post('/proposals').send(p)
      .set('Authorization', g.authHeader)
      .end (err, res) ->
        res.should.have.status(200)
        res.should.be.json
        res.body.title.should.eql p.title
        res.body.body.should.eql p.body
        g.prop1 = res.body
        done()

    it 'must NOT update not mine proposal', (done) ->
      updated =
        title: 'updated1'
      chai.request(g.baseurl)
      .put("/proposals/#{g.prop1.id}").set('Authorization', g.authHeader2)
      .send(updated)
      .end (err, res) ->
        res.should.have.status(400)
        should.not.exist(res.body.title)
        should.not.exist(res.body.id)
        done()

    it 'must update mine proposal', (done) ->
      g.prop1.title = 'updated1'
      chai.request(g.baseurl)
      .put("/proposals/#{g.prop1.id}").set('Authorization', g.authHeader)
      .send(g.prop1)
      .end (err, res) ->
        res.should.have.status(200)
        res.should.be.json
        res.body.title.should.eql g.prop1.title
        res.body.body.should.eql g.prop1.body
        done()

    it 'must NOT delete not mine proposal', (done) ->
      chai.request(g.baseurl)
      .delete("/proposals/#{g.prop1.id}").set('Authorization', g.authHeader2)
      .end (err, res) ->
        res.should.have.status(400)
        should.not.exist(res.body.title)
        should.not.exist(res.body.id)
        done()
