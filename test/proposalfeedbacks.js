/* global describe it before */
const chai = require('chai')
const should = chai.should()

module.exports = function (g) {
  //
  const r = chai.request(g.baseurl)

  return describe('proposalfeedbacks (PF)', function () {
    const p = {
      title: 'prop1',
      content: 'I propose to have a party'
    }

    before(function () {
      return r.post('/proposals').send(p).set('Authorization', g.authHeader)
      .then(function (res) {
        res.should.have.status(201)
        res.should.have.header('content-type', /^application\/json/)
        res.body.title.should.eql(p.title)
        res.body.content.should.eql(p.content)
        p.id = res.body.id
      })
    })

    it('must NOT create new PF connected to notexistent proposal', function (done) {
      r.post('/proposals/NOTEXISTS/feedbacks').set('Authorization', g.authHeader).send({value: 1})
      .end(function (err, res) {
        if (err) {
          res.should.have.status(400)
          should.not.exist(res.body.title)
          should.not.exist(res.body.id)
          return done()
        }
        done('error expected')
      })
    })

    it('must NOT create new PF with wrong value', function (done) {
      r.post('/proposals/' + p.id + '/feedbacks').set('Authorization', g.authHeader).send({value: 'wrong'})
      .end(function (err, res) {
        if (err) {
          res.should.have.status(400)
          should.not.exist(res.body.title)
          should.not.exist(res.body.id)
          return done()
        }
        done('error expected')
      })
    })

    it('must create new PF', function () {
      return r.post('/proposals/' + p.id + '/feedbacks').set('Authorization', g.authHeader).send({value: 1})
      .then(function (res) {
        res.should.have.status(201)
        res.should.have.header('content-type', /^application\/json/)
        res.body.proposalid.should.eql(p.id.toString())
        res.body.uid.should.eql(g.loggedUser.id)
      })
    })

    it('must NOT create duplicate PF on same proposal', function (done) {
      r.post('/proposals/' + p.id + '/feedbacks').set('Authorization', g.authHeader).send({value: 1})
      .end(function (err, res) {
        if (err) {
          res.should.have.status(400)
          should.not.exist(res.body.title)
          should.not.exist(res.body.id)
          return done()
        }
        done('error expected')
      })
    })

    return it('must delete mine proposal feedback', function () {
      return r.delete('/proposals/' + p.id + '/feedbacks').set('Authorization', g.authHeader)
      .then(function (res) {
        res.should.have.status(200)
      })
    })
  })
}
