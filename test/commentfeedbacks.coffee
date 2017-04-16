chai = require('chai')
should = chai.should()


module.exports = (g)->

  r = chai.request(g.baseurl)

  describe 'commentfeedbacks (CF)', ->

    p =
      title: 'CFprop1'
      content: 'I propose to elect pirates'

    c =
      content: 'good idea'

    before ()->
      # prepare proposal
      return r.post('/proposals').send(p).set('Authorization', g.authHeader)
      .then (res)->
        res.should.have.status(201)
        res.should.be.json
        p.id = c.parent = res.body.id
        # create comment
        return r.post('/comments').send(c).set('Authorization', g.authHeader)
      .then (res)->
        res.should.have.status(201)
        res.should.be.json
        c.id = res.body.id

    it 'must NOT create new PF connected to notexistent proposal', (done) ->
      r.post("/comments/NOTEXISTS/feedbacks")
      .set('Authorization', g.authHeader)
      .send({value: 1})
      .end (err, res) ->
        res.should.have.status(400)
        should.not.exist(res.body.value)
        should.not.exist(res.body.id)
        done()
      return

    it 'must NOT create new PF with wrong value', (done) ->
      r.post("/comments/#{c.id}/feedbacks")
      .set('Authorization', g.authHeader)
      .send({value: 'wrong'})
      .end (err, res) ->
        res.should.have.status(400)
        should.not.exist(res.body.title)
        should.not.exist(res.body.id)
        done()
      return

    it 'must create new PF', () ->
      return r.post("/comments/#{c.id}/feedbacks")
      .set('Authorization', g.authHeader)
      .send({value: 1})
      .then (res)->
        res.should.have.status(201)
        res.should.be.json
        res.body.value.should.eql 1
        res.body.uid.should.eql g.loggedUser.id

    it 'must NOT create duplicate PF on same comment', (done) ->
      r.post("/comments/#{c.id}/feedbacks")
      .set('Authorization', g.authHeader)
      .send({value: 1})
      .end (err, res)->
        res.should.have.status(400)
        should.not.exist(res.body.title)
        should.not.exist(res.body.id)
        done()
      return

    it 'must delete mine PF', () ->
      return r.delete("/comments/#{c.id}/feedbacks")
      .set('Authorization', g.authHeader)
      .then (res)->
        res.should.have.status(200)

    it 'must delete PF with pushing value -1', () ->
      # create PF with value 1
      return r.post("/comments/#{c.id}/feedbacks")
      .set('Authorization', g.authHeader)
      .send({value: 1})
      .then (res)->
        res.should.have.status(201)
        # now create PF with value -1
        return r.post("/comments/#{c.id}/feedbacks")
        .set('Authorization', g.authHeader)
        .send({value: -1})
      .then (res)->
        res.should.have.status(201)
        # commets feedbacks shall now be []
        # so get comment
        return r.get("/comments/#{p.id}?load=feedbacks")
        .set('Authorization', g.authHeader)
      .then (res)->
        # and verify it
        res.should.have.status(200)
        res.should.be.json
        res.body.length.should.be.above 0
        res.body[0].feedbacks.should.eql []
      .catch (err)->
        console.log err.text
