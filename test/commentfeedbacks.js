/* global describe it before */
const chai = require('chai')
const should = chai.should()
const Utils = require('./utils')

module.exports = (g) => {
  //
  const r = chai.request(g.baseurl)

  describe('commentfeedbacks (CF)', () => {
    const p = {
      typ: 'proposal',
      title: 'CFprop1'
    }
    const c = {
      content: 'good idea'
    }

    before(() => {
      return Utils.createProposal(r, g, p)
      .then((res) => {
        c.parent = p.id
        return r.post('/comments').send(c).set('Authorization', g.authHeader)
      })
      .then((res) => {
        res.should.have.status(201)
        c.id = res.body.id
      })
    })

    it('must NOT create new PF connected to notexistent proposal', (done) => {
      r.post('/comments/NOTEXISTS/feedbacks').set('Authorization', g.authHeader).send({value: 1})
      .end((err, res) => {
        if (err) {
          res.should.have.status(400)
          should.not.exist(res.body.value)
          should.not.exist(res.body.id)
          return done()
        }
        done('error expected')
      })
    })

    it('must NOT create new PF with wrong value', (done) => {
      r.post(`/comments/${c.id}/feedbacks`).set('Authorization', g.authHeader).send({value: 'wrong'})
      .end((err, res) => {
        if (err) {
          res.should.have.status(400)
          should.not.exist(res.body.title)
          should.not.exist(res.body.id)
          return done()
        }
        done('error expected')
      })
    })

    it('must create new PF', () => {
      return r.post(`/comments/${c.id}/feedbacks`).set('Authorization', g.authHeader).send({value: 1})
      .then((res) => {
        res.should.have.status(201)
        res.should.have.header('content-type', /^application\/json/)
        res.body.value.should.eql(1)
        res.body.uid.should.eql(g.loggedUser.id)
        return r.get('/comments/' + c.parent).set('Authorization', g.authHeader)
      })
      .then((res) => {
        res.should.have.status(200)
        res.should.have.header('content-type', /^application\/json/)
        res.body.length.should.eql(1)
        res.body[0].upvotes.should.eql(1)
        res.body[0].downvotes.should.eql(0)
      })
    })

    it('must NOT create duplicate PF on same comment', (done) => {
      r.post(`/comments/${c.id}/feedbacks`).set('Authorization', g.authHeader).send({value: 1})
      .end((err, res) => {
        if (err) {
          res.should.have.status(400)
          should.not.exist(res.body.title)
          should.not.exist(res.body.id)
          return done()
        }
        return 'expected to be errored'
      })
    })

    // TODO:   it('must NOT delete mine PF', () => {

    it('must delete mine PF', () => {
      return r.delete(`/comments/${c.id}/feedbacks`).set('Authorization', g.authHeader)
      .then((res) => {
        res.should.have.status(200)
        return r.get('/comments/' + c.parent).set('Authorization', g.authHeader)
      })
      .then((res) => {
        res.should.have.status(200)
        res.should.have.header('content-type', /^application\/json/)
        res.body[0].upvotes.should.eql(0)
        res.body[0].downvotes.should.eql(0)
      })
    })

    it('must delete PF with pushing value -1', () => {
      return r.post(`/comments/${c.id}/feedbacks`).set('Authorization', g.authHeader).send({value: 1})
      .then((res) => {
        res.should.have.status(201)
        return r.post(`/comments/${c.id}/feedbacks`).set('Authorization', g.authHeader).send({value: -1})
      })
      .then((res) => {
        res.should.have.status(201)
        return r.get(`/comments/${p.id}/feedbacks`).set('Authorization', g.authHeader)
      })
      .then((res) => {
        res.should.have.status(200)
        res.should.have.header('content-type', /^application\/json/)
        res.body.length.should.eql(0)
        res.body.should.eql([])
        return r.get(`/comments/${c.parent}`).set('Authorization', g.authHeader)
      })
      .then((res) => {
        res.should.have.status(200)
        res.should.have.header('content-type', /^application\/json/)
        console.log(res.body)
        res.body[0].upvotes.should.eql(0)
        res.body[0].downvotes.should.eql(0)
      })
    })

    return it('must list my feedbacks for given comment', () => {
      return r.post(`/comments/${c.id}/feedbacks`).set('Authorization', g.authHeader2).send({value: -1})
      .then((res) => {
        return r.post(`/comments/${c.id}/feedbacks`).set('Authorization', g.authHeader).send({value: 1})
      })
      .then((res) => {
        return r.get(`/comments/${c.id}/feedbacks`).set('Authorization', g.authHeader)
      })
      .then((res) => {
        res.should.have.status(200)
        res.should.have.header('content-type', /^application\/json/)
        res.body.length.should.eql(1)
        res.body[0].value.should.eql(1)
        return res.body[0].uid.should.eql(g.loggedUser.id)
      })
    })
  })
}
