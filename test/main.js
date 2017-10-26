/* global describe it before after */
const chai = require('chai')
const chaiHttp = require('chai-http')
chai.use(chaiHttp)
const should = chai.should()

process.env.SERVER_SECRET = 'fhdsakjhfkjal'
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

describe('app', () => {
  g.app = require('../app')

  before((done) => {
    // this.timeout(5000)
    g.db = require('../db')
    g.db.migrate.rollback()
    .then(() => {
      return g.db.migrate.latest()
    })
    .then(() => {
      g.server = g.app.listen(port, (err) => {
        return err ? done(err) : done()
      })
    })
    .catch(done)
  })

  after((done) => {
    g.server.close()
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
      './votings'
    ]
    submodules.map((i) => {
      const subMod = require(i)
      subMod(g)
    })
  })
})
