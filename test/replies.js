/* global describe it */
const chai = require('chai')
const should = chai.should()

module.exports = function (g) {
  //
  const r = chai.request(g.baseurl)

  return describe('reply', function () {
    //
    it('must NOT create new item with missing mandatories', function (done) {
      r.post('/comments/' + g.comment1.id + '/replies').set('Authorization', g.authHeader).send({})
      .end(function (err, res) {
        if (err) {
          res.should.have.status(400)
          should.not.exist(res.body.content)
          should.not.exist(res.body.id)
          return done()
        }
        done('error expected')
      })
    })

    it('shall create a new item', function () {
      const item = {
        content: 'I am fancy comment'
      }
      return r.post('/comments/' + g.comment1.id + '/replies').send(item).set('Authorization', g.authHeader)
      .then(function (res) {
        res.should.have.status(201)
        res.should.have.header('content-type', /^application\/json/)
        res.body.content.should.eql(item.content)
        g.reply1 = res.body
      })
    })

    it('must NOT update not mine reply', function () {
      const updated = {
        content: 'updated1reply'
      }
      return r.put('/comments/' + g.comment1.id + '/replies/' + g.reply1.id).set('Authorization', g.authHeader2)
      .send(updated)
      .then(function (res) {
        res.should.have.status(200)
        res.should.have.header('content-type', /^application\/json/)
        res.body.length.should.eql(0)
      })
    })

    it('must update mine proposal', function () {
      g.reply1.content = 'updated comment'
      return r.put('/comments/' + g.comment1.id + '/replies/' + g.reply1.id).set('Authorization', g.authHeader)
      .send({
        content: g.reply1.content
      })
      .then(function (res) {
        res.should.have.status(200)
        res.should.have.header('content-type', /^application\/json/)
        return res.body[0].content.should.eql(g.reply1.content)
      })
    })

    return it('must NOT delete comment', function (done) {
      r.delete('/comments/' + g.comment1.id + '/replies/' + g.reply1.id).set('Authorization', g.authHeader)
      .end(function (err, res) {
        if (err) {
          res.should.have.status(404)
          return done()
        }
        done('error expected')
      })
    })
  })
}
