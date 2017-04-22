
chai = require('chai')
should = chai.should()

module.exports = (g)->

  r = chai.request(g.baseurl)

  describe 'proposals', ->

    it 'must NOT create new proposal with missing mandatories', (done) ->
      r.post('/proposals').set('Authorization', g.authHeader)
      .send({title: 'prop1'})
      .end (err, res) ->
        res.should.have.status(400)
        should.not.exist(res.body.title)
        should.not.exist(res.body.id)
        done()
      return

    it 'shall create a new proposal', () ->
      p =
        title: 'prop1'
        content: 'I propose to have a party'
      r.post('/proposals').send(p).set('Authorization', g.authHeader)
      .then (res) ->
        res.should.have.status(201)
        res.should.be.json
        res.body.title.should.eql p.title
        res.body.content.should.eql p.content
        g.prop1 = res.body

    it 'must NOT update not mine proposal', (done) ->
      updated =
        title: 'updated1'
      r.put("/proposals/#{g.prop1.id}").set('Authorization', g.authHeader2)
      .send(updated)
      .end (err, res) ->
        res.should.have.status(400)
        should.not.exist(res.body.title)
        should.not.exist(res.body.id)
        done()
      return

    it 'must update mine proposal', () ->
      g.prop1.title = 'updated1'
      r.put("/proposals/#{g.prop1.id}").set('Authorization', g.authHeader)
      .send(g.prop1)
      .then (res) ->
        res.should.have.status(200)
        res.should.be.json
        res.body.title.should.eql g.prop1.title
        res.body.content.should.eql g.prop1.content

    it 'must NOT delete not mine proposal', (done) ->
      r.delete("/proposals/#{g.prop1.id}").set('Authorization', g.authHeader2)
      .end (err, res) ->
        res.should.have.status(400)
        should.not.exist(res.body.title)
        should.not.exist(res.body.id)
        done()
      return

    it 'must NOT delete other than draft item', (done) ->
      g.prop1.status = 'voting'
      r.put("/proposals/#{g.prop1.id}").set('Authorization', g.authHeader)
      .send({status: 'voting'})
      .end (err, res) ->
        return done(err) if err
        res.should.have.status(200) # updated
        # now try to delete it
        chai.request(g.baseurl)
        .delete("/proposals/#{g.prop1.id}").set('Authorization', g.authHeader)
        .end (err, res) ->
          res.should.have.status(400)
          should.not.exist(res.body.title)
          should.not.exist(res.body.id)
          done()
      return

    it 'must delete mine draft proposal', () ->
      r.put("/proposals/#{g.prop1.id}").set('Authorization', g.authHeader)
      .send({status: 'draft'})
      .then (res) ->
        res.should.have.status(200) # updated
        # now delete it
        return chai.request(g.baseurl)
        .delete("/proposals/#{g.prop1.id}").set('Authorization', g.authHeader)
      .then (res) ->
        res.should.have.status(200)
