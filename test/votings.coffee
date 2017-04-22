
chai = require('chai')
should = chai.should()

module.exports = (g)->

  r = chai.request(g.baseurl)

  describe 'votings', ->

    it 'must list all votings', () ->
      r.get("/votings/").set('Authorization', g.authHeader).then (res) ->
        res.should.have.status(200)
