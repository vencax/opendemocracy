/* global describe it before */
const chai = require('chai')
const should = chai.should()

module.exports = function (g) {
  //
  const r = chai.request(g.baseurl)

  return describe('comments', function () {
    //
    const p = {
      title: 'commeted proposal',
      content: 'I need to be commented'
    }

    before(function () {
      return r.post('/proposals').send(p).set('Authorization', g.authHeader)
      .then(function (res) {
        res.should.have.status(201)
        res.should.have.header('content-type', /^application\/json/)
        p.id = res.body.id
      })
    })

    it('must NOT create new comments with missing mandatories', function (done) {
      r.post('/comments').set('Authorization', g.authHeader)
      .send({body: 'nice comment'})
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

    it('shall create a new comment', function () {
      const c = {
        parent: p.id,
        content: 'I am fancy comment'
      }
      return r.post('/comments').send(c).set('Authorization', g.authHeader)
      .then(function (res) {
        res.should.have.status(201)
        res.should.have.header('content-type', /^application\/json/)
        res.body.content.should.eql(c.content)
        g.comment1 = res.body
        return r.get(`/proposals/${p.id}`).set('Authorization', g.authHeader)
      })
      .then(res => {
        res.should.have.status(200)
        res.body.comment_count.should.eql(1)
      })
    })

    it('must NOT update not mine comment', function (done) {
      const updated = {
        content: 'updated1'
      }
      r.put('/comments/' + g.comment1.id).set('Authorization', g.authHeader2)
      .send(updated)
      .end(function (err, res) {
        if (err) {
          res.should.have.status(400)
          should.not.exist(res.body.id)
          return done()
        }
        done('error expected')
      })
    })

    it('must update mine proposal', function () {
      g.comment1.content = 'updated comment'
      return r.put('/comments/' + g.comment1.id).set('Authorization', g.authHeader)
      .send({
        content: g.comment1.content
      })
      .then(function (res) {
        res.should.have.status(200)
        res.should.have.header('content-type', /^application\/json/)
        return res.body.content.should.eql(g.comment1.content)
      })
    })

    return it('must NOT delete comment', function (done) {
      r.delete('/comments/' + g.comment1.id).set('Authorization', g.authHeader)
      .end(function (err, res) {
        if (err) {
          res.should.have.status(404)
          return done()
        }
        done('expected error')
      })
    })
  })
}
