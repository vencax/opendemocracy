
chai = require('chai')
should = chai.should()

module.exports = (g)->

  r = chai.request(g.baseurl)

  describe 'comments', ->

    p =
      title: 'commeted proposal'
      content: 'I need to be commented'

    before ()->
      # prepare proposal
      return r.post('/proposals').send(p).set('Authorization', g.authHeader)
      .then (res)->
        res.should.have.status(201)
        res.should.be.json
        p.id = res.body.id

    it 'must NOT create new comments with missing mandatories', (done) ->
      r.post('/comments').set('Authorization', g.authHeader)
      .send({body: 'nice comment'})
      .end (err, res) ->
        res.should.have.status(400)
        should.not.exist(res.body.content)
        should.not.exist(res.body.id)
        done()
      return

    it 'shall create a new comment', () ->
      c =
        parent: p.id
        content: 'I am fancy comment'
      return r.post('/comments').send(c)
      .set('Authorization', g.authHeader)
      .then (res) ->
        res.should.have.status(201)
        res.should.be.json
        res.body.content.should.eql c.content
        g.comment1 = res.body

    it 'must NOT update not mine comment', (done) ->
      updated =
        content: 'updated1'
      r.put("/comments/#{g.comment1.id}").set('Authorization', g.authHeader2)
      .send(updated)
      .end (err, res) ->
        res.should.have.status(400)
        should.not.exist(res.body.id)
        done()
      return

    it 'must update mine proposal', () ->
      g.comment1.content = 'updated comment'
      return r.put("/comments/#{g.comment1.id}").set('Authorization', g.authHeader)
      .send(content: g.comment1.content)
      .then (res) ->
        res.should.have.status(200)
        res.should.be.json
        res.body.content.should.eql g.comment1.content

    it 'must NOT delete comment', (done) ->
      r.delete("/comments/#{g.comment1.id}").set('Authorization', g.authHeader)
      .end (err, res) ->
        res.should.have.status(404)
        done()
      return
