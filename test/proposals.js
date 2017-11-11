/* global describe it */
const chai = require('chai')
const should = chai.should()

module.exports = function (g) {
  //
  const r = chai.request(g.baseurl)

  return describe('proposals', function () {
    //
    it('must NOT create new proposal with missing mandatories', function (done) {
      r.post('/proposals').set('Authorization', g.authHeader).send({title: 'prop1'})
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

    it('shall create a new proposal', function () {
      const p = {
        title: 'prop1',
        content: 'I propose to have a party',
        tags: 'tag1'
      }
      return r.post('/proposals').send(p).set('Authorization', g.authHeader)
      .then(function (res) {
        res.should.have.status(201)
        res.should.have.header('content-type', /^application\/json/)
        res.body.title.should.eql(p.title)
        res.body.content.should.eql(p.content)
        g.prop1 = res.body
      })
    })

    it('must NOT update not mine proposal', function (done) {
      const updated = {
        title: 'updated1'
      }
      r.put('/proposals/' + g.prop1.id).set('Authorization', g.authHeader2).send(updated)
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

    it('must update mine proposal', function () {
      g.prop1.title = 'updated1'
      return r.put('/proposals/' + g.prop1.id).set('Authorization', g.authHeader).send(g.prop1)
      .then(function (res) {
        res.should.have.status(200)
        res.should.have.header('content-type', /^application\/json/)
        res.body.title.should.eql(g.prop1.title)
        res.body.content.should.eql(g.prop1.content)
      })
    })

    it('must NOT delete not mine proposal', function (done) {
      r.delete('/proposals/' + g.prop1.id).set('Authorization', g.authHeader2)
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

    it('must publish proposal', function () {
      return r.put(`/proposals/${g.prop1.id}/publish`).set('Authorization', g.authHeader)
      .then(function (res) {
        res.should.have.status(200)
      })
    })

    it('must NOT delete other than draft item', function (done) {
      g.prop1.status = 'voting'
      r.put('/proposals/' + g.prop1.id).set('Authorization', g.authHeader).send({status: 'voting'})
      .end(function (err, res) {
        if (err) {
          return done(err)
        }
        res.should.have.status(200)
        r.delete('/proposals/' + g.prop1.id).set('Authorization', g.authHeader)
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
    })

    return it('must delete mine draft proposal', function () {
      return r.put('/proposals/' + g.prop1.id).set('Authorization', g.authHeader).send({status: 'draft'})
      .then(function (res) {
        res.should.have.status(200)
        return r.delete('/proposals/' + g.prop1.id).set('Authorization', g.authHeader)
      })
      .then(function (res) {
        res.should.have.status(200)
      })
    })
  })
}
