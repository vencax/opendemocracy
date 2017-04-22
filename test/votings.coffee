
chai = require('chai')
moment = require('moment')
should = chai.should()

module.exports = (g)->

  r = chai.request(g.baseurl)

  describe 'votings', ->

    voting =
      begins: moment().subtract('days', 1).toDate()
      ends:  moment().add('days', 1).toDate()

    before ()->
      # prepare voting
      voting.proposalid = g.prop1.id
      newitem = new g.db.models.Voting(voting)
      newitem.save().then (saved) ->
        voting = saved

    it 'must list all votings', () ->
      r.get("/votings").set('Authorization', g.authHeader).then (res) ->
        res.should.have.status(200)

    it 'must cast a vote', () ->
      r.post("/votings/#{voting.id}/casts").set('Authorization', g.authHeader)
      .send(content: '12,23,43')
      .then (res) ->
        res.should.have.status(201)

    it 'must update a cast', () ->
      r.put("/votings/#{voting.id}/casts").set('Authorization', g.authHeader)
      .send(content: '43')
      .then (res) ->
        res.should.have.status(200)

    it 'must delete a cast', () ->
      r.delete("/votings/#{voting.id}/casts").set('Authorization', g.authHeader)
      .then (res) ->
        res.should.have.status(200)
