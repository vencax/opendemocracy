/* global describe it before after */
const fs = require('fs')
const chai = require('chai')
const chaiHttp = require('chai-http')
chai.use(chaiHttp)
const should = chai.should()
const express = require('express')

process.env.SERVER_SECRET = 'fhdsakjhfkjal'
const rand = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 15)
process.env.DATABASE_URL = rand + 'test.sqlite'
process.env.NODE_ENV = 'test'
const port = process.env.PORT || 3333
const g = {
  loggedUser: {
    id: 111,
    username: 'gandalf',
    email: 'gandalf@shire.nz'
  },
  loggedUser2: {
    id: 11,
    username: 'saruman',
    email: 'saruman@mordor.cz'
  },
  baseurl: 'http://localhost:' + port
}
function sendMail (mail) {
  return new Promise((resolve, reject) => {
    g.sentemails.push(mail)
    resolve(mail)
  })
}

describe('app', () => {
  const App = require('../app')

  before((done) => {
    // this.timeout(5000)
    g.db = require('../db')
    g.db.migrate.rollback()
    .then(() => {
      return g.db.migrate.latest()
    })
    .then(() => {
      g.app = express()
      App(g.app, sendMail)
      g.server = g.app.listen(port, (err) => {
        return err ? done(err) : done()
      })
    })
    .catch(done)
  })

  after((done) => {
    g.server.close()
    fs.unlinkSync(process.env.DATABASE_URL)
    done()
  })

  it('should exist', (done) => {
    should.exist(g.app)
    return done()
  })

  describe('API', () => {
    //
    before(() => {
      const r = chai.request(g.baseurl)
      return r.post('/login').send(g.loggedUser)
      .then((res) => {
        res.should.have.status(200)
        g.token = res.body.token
        g.authHeader = 'Bearer ' + g.token
        return r.post('/login').send(g.loggedUser2)
      })
      .then((res) => {
        res.should.have.status(200)
        g.token2 = res.body.token
        g.authHeader2 = 'Bearer ' + g.token2
      })
    })

    const submodules = [
      './proposals',
      './proposalfeedbacks',
      './proposaloptions',
      './comments',
      './replies',
      './commentfeedbacks',
      './votings',
      './notifications'
    ]
    submodules.map((i) => {
      const subMod = require(i)
      subMod(g)
    })
  })
})
