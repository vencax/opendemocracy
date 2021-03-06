/* global describe it before */
const chai = require('chai')
const should = chai.should()
const Utils = require('./utils')

module.exports = function (g) {
  //
  const r = chai.request(g.baseurl)

  return describe('proposal options (PO)', function () {
    const p = {
      typ: 'proposal',
      title: 'prop2'
    }
    const opt = {
      title: 'Option1',
      content: 'Option1content'
    }
    before(function () {
      return Utils.createProposal(r, g, p)
    })

    it('must create new PO', function () {
      return r.post('/proposals/' + p.id + '/options').set('Authorization', g.authHeader).send(opt)
      .then(function (res) {
        res.should.have.status(201)
        res.should.have.header('content-type', /^application\/json/)
        res.body.proposalid.should.eql(p.id)
        res.body.title.should.eql(opt.title)
        opt.id = res.body.id
      })
    })

    it('must update PO', function () {
      return r.put('/proposals/' + p.id + '/options/' + opt.id).set('Authorization', g.authHeader)
      .send({
        title: 'Option1UPDATED'
      })
      .then(function (res) {
        res.should.have.status(200)
        res.should.have.header('content-type', /^application\/json/)
        res.body[0].title.should.eql('Option1UPDATED')
        opt.title = 'Option1UPDATED'
      })
    })

    it('must NOT create new PO connected to notexistent proposal', function (done) {
      r.post('/proposals/NOTEXISTS/options').set('Authorization', g.authHeader).send({value: 1})
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

    it('must NOT create new PO when proposal not in draft mode', function (done) {
      Utils.updateProposal(g, p, {status: 'discussing'})
      .then(() => {
        r.post('/proposals/' + p.id + '/options').set('Authorization', g.authHeader).send(opt)
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
      .catch(done)
    })

    it('must NOT delete NOT mine PO', function (done) {
      Utils.updateProposal(g, p, {status: 'draft'})
      .then(() => {
        r.delete('/proposals/' + p.id + '/options/' + opt.id).set('Authorization', g.authHeader2)
        .end(function (err, res) {
          if (err) {
            res.should.have.status(400)
            return done()
          }
          done('error expected')
        })
      })
      .catch(done)
    })

    return it('must delete mine PO', function () {
      return r.delete('/proposals/' + p.id + '/options/' + opt.id).set('Authorization', g.authHeader)
      .then(function (res) {
        res.should.have.status(200)
      })
    })
  })
}
