/* global describe it before */
const chai = require('chai')
const moment = require('moment')
// const should = chai.should()

module.exports = function (g) {
  const r = chai.request(g.baseurl)

  return describe('votings', function () {
    const p = {
      title: 'prop3',
      content: 'I propose to vote pirates!!',
      votingbegins: moment().subtract('days', 1).toDate(),
      votingends: moment().add('days', 1).toDate(),
      status: 'voting'
    }
    const opts = [
      {
        title: 'opt1',
        content: 'op1cont'
      }, {
        title: 'opt2',
        content: 'op2cont'
      }, {
        title: 'opt3',
        content: 'op3cont'
      }
    ]

    before(function () {
      return r.post('/proposals').send(p).set('Authorization', g.authHeader)
      .then(function (res) {
        res.should.have.status(201)
        p.id = res.body.id
        return r.post('/proposals/' + p.id + '/options').set('Authorization', g.authHeader).send(opts[0])
      })
      .then(function (res) {
        res.should.have.status(201)
        opts[0].id = res.body.id
        return r.post('/proposals/' + p.id + '/options').set('Authorization', g.authHeader).send(opts[1])
      })
      .then(function (res) {
        res.should.have.status(201)
        opts[1].id = res.body.id
        return r.post('/proposals/' + p.id + '/options').set('Authorization', g.authHeader).send(opts[2])
      })
      .then(function (res) {
        res.should.have.status(201)
        opts[2].id = res.body.id
      })
    })

    it('must cast a vote', function () {
      return r.post(`/proposals/${p.id}/casts`).set('Authorization', g.authHeader).send({
        content: opts[0].id + ',' + opts[2].id
      })
      .then(function (res) {
        res.should.have.status(201)
      })
    })

    it('must update a cast', function () {
      return r.put(`/proposals/${p.id}/casts`).set('Authorization', g.authHeader).send({
        content: opts[1].id
      })
      .then(function (res) {
        res.should.have.status(200)
      })
    })

    it('must delete a cast', function () {
      return r.delete(`/proposals/${p.id}/casts`).set('Authorization', g.authHeader)
      .then(function (res) {
        res.should.have.status(200)
      })
    })

    it('must NOT cast a vote with not existing options', function (done) {
      r.post(`/proposals/${p.id}/casts`).set('Authorization', g.authHeader).send({
        content: '123,34242'
      })
      .end(function (err, res) {
        if (err) {
          res.should.have.status(400)
          return done()
        }
        done('error expected')
      })
    })
  })
}
