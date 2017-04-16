chai = require('chai')
should = chai.should()


module.exports = (g)->

  r = chai.request(g.baseurl)

  describe 'reply', ->

    it 'must NOT create new item with missing mandatories', (done) ->
      r.post("/comments/#{g.comment1.id}/replies")
      .set('Authorization', g.authHeader)
      .send({})
      .end (err, res) ->
        res.should.have.status(400)
        should.not.exist(res.body.content)
        should.not.exist(res.body.id)
        done()
      return

    it 'shall create a new item', () ->
      item =
        content: 'I am fancy comment'
      return r.post("/comments/#{g.comment1.id}/replies").send(item)
      .set('Authorization', g.authHeader)
      .then (res) ->
        res.should.have.status(201)
        res.should.be.json
        res.body.content.should.eql item.content
        g.reply1 = res.body

    it 'must NOT update not mine comment', (done) ->
      updated =
        content: 'updated1reply'
      r.put("/comments/#{g.comment1.id}/replies/#{g.reply1.id}")
      .set('Authorization', g.authHeader2)
      .send(updated)
      .end (err, res) ->
        res.should.have.status(200)
        res.should.be.json
        res.body.length.should.eql 0
        done()
      return

    it 'must update mine proposal', () ->
      g.reply1.content = 'updated comment'
      return r.put("/comments/#{g.comment1.id}/replies/#{g.reply1.id}")
      .set('Authorization', g.authHeader)
      .send(content: g.reply1.content)
      .then (res) ->
        res.should.have.status(200)
        res.should.be.json
        res.body[0].content.should.eql g.reply1.content

    it 'must NOT delete comment', (done) ->
      r.delete("/comments/#{g.comment1.id}/replies/#{g.reply1.id}")
      .set('Authorization', g.authHeader)
      .end (err, res) ->
        res.should.have.status(404)
        done()
      return
