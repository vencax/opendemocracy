/* global describe it before */
const chai = require('chai')
const moment = require('moment')
// const should = chai.should()

module.exports = function (g) {
  const r = chai.request(g.baseurl)

  return describe('votings', function () {
    let voting = {
      begins: moment().subtract('days', 1).toDate(),
      ends: moment().add('days', 1).toDate()
    }
    const p = {
      title: 'prop3',
      content: 'I propose to vote pirates!!'
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
        voting.proposalid = p.id = res.body.id
        const newvoting = new g.db.models.Voting(voting)
        return newvoting.save()
      })
      .then(function (saved) {
        voting = saved
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

    it('must list all votings', function () {
      return r.get('/votings').set('Authorization', g.authHeader)
      .then(function (res) {
        return res.should.have.status(200)
      })
    })

    it('must cast a vote', function () {
      return r.post('/votings/' + voting.id + '/casts').set('Authorization', g.authHeader).send({
        content: opts[0].id + ',' + opts[2].id
      })
      .then(function (res) {
        res.should.have.status(201)
      })
    })

    it('must update a cast', function () {
      return r.put('/votings/' + voting.id + '/casts').set('Authorization', g.authHeader).send({
        content: opts[1].id
      })
      .then(function (res) {
        res.should.have.status(200)
      })
    })

    it('must delete a cast', function () {
      return r.delete('/votings/' + voting.id + '/casts').set('Authorization', g.authHeader)
      .then(function (res) {
        res.should.have.status(200)
      })
    })

    it('must NOT cast a vote with not existing options', function (done) {
      r.post('/votings/' + voting.id + '/casts').set('Authorization', g.authHeader).send({
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

    it('must change the voting window to future', function () {
      const item = new g.db.models.Voting({
        id: voting.id
      })
      return item.fetch().then(function (fetched) {
        fetched.set({
          begins: moment().add('days', 10).toDate(),
          ends: moment().add('days', 11).toDate()
        })
        return fetched.save()
      })
    })

    it('must NOT cast a vote before voting begins', function (done) {
      r.post('/votings/' + voting.id + '/casts').set('Authorization', g.authHeader).send({
        content: opts[0].id
      })
      .end(function (err, res) {
        if (err) {
          res.should.have.status(400)
          return done()
        }
        done('error expected')
      })
    })

    it('must change the voting window to past', function () {
      const item = new g.db.models.Voting({
        id: voting.id
      })
      return item.fetch().then(function (fetched) {
        fetched.set({
          begins: moment().subtract('days', 11).toDate(),
          ends: moment().subtract('days', 10).toDate()
        })
        return fetched.save()
      })
    })

    return it('must NOT cast a vote after voting ends', function (done) {
      r.post('/votings/' + voting.id + '/casts').set('Authorization', g.authHeader).send({
        content: opts[0].id
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
