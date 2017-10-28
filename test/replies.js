/* global describe it before */
const chai = require('chai')
const should = chai.should()

module.exports = function (g) {
  //
  const r = chai.request(g.baseurl)

  return describe('reply', function () {
    //
    const p = {
      title: 'CFpropForReply',
      content: 'reply proposal'
    }
    const c = {
      content: 'good idea'
    }

    before(() => {
      return r.post('/proposals').send(p).set('Authorization', g.authHeader)
      .then((res) => {
        res.should.have.status(201)
        p.id = c.parent = res.body.id
        return r.post('/comments').send(c).set('Authorization', g.authHeader)
      })
      .then((res) => {
        res.should.have.status(201)
        c.id = res.body.id
      })
    })

    it('must NOT create new item with missing mandatories', function (done) {
      r.post('/comments/' + c.id + '/replies').set('Authorization', g.authHeader).send({})
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
        content: 'I am fancy reply'
      }
      return r.post('/comments/' + c.id + '/replies').send(item).set('Authorization', g.authHeader)
      .then(function (res) {
        res.should.have.status(201)
        res.should.have.header('content-type', /^application\/json/)
        res.body.content.should.eql(item.content)
        g.reply1 = res.body
        return r.get(`/comments/${p.id}`).set('Authorization', g.authHeader)
      })
      .then(res => {
        res.should.have.status(200)
        res.body.find(i => i.id === c.id).reply_count.should.eql(1)
      })
    })

    it('must NOT update not mine reply', function () {
      const updated = {
        content: 'updated1reply'
      }
      return r.put('/comments/' + c.id + '/replies/' + g.reply1.id).set('Authorization', g.authHeader2)
      .send(updated)
      .then(function (res) {
        res.should.have.status(200)
        res.should.have.header('content-type', /^application\/json/)
        res.body.length.should.eql(0)
      })
    })

    it('must update mine proposal', function () {
      g.reply1.content = 'updated comment'
      return r.put('/comments/' + c.id + '/replies/' + g.reply1.id).set('Authorization', g.authHeader)
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
      r.delete('/comments/' + c.id + '/replies/' + g.reply1.id).set('Authorization', g.authHeader)
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
