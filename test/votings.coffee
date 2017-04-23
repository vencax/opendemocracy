
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

    it 'must change the voting window to future', () ->
      item = new (g.db.models.Voting)(id: voting.id)
      return item.fetch().then (fetched) ->
        fetched.set
          begins: moment().add('days', 10).toDate()
          ends: moment().add('days', 11).toDate()
        return fetched.save()

    it 'must NOT cast a vote before voting begins', (done) ->
      r.post('/votings/' + voting.id + '/casts')
      .set('Authorization', g.authHeader).send(content: '12,23,43')
      .end (err, res) ->
        res.should.have.status 400
        done()
      return

    it 'must change the voting window to past', () ->
      item = new (g.db.models.Voting)(id: voting.id)
      return item.fetch().then (fetched) ->
        fetched.set
          begins: moment().subtract('days', 11).toDate()
          ends: moment().subtract('days', 10).toDate()
        return fetched.save()

    it 'must NOT cast a vote after voting ends', (done) ->
      r.post('/votings/' + voting.id + '/casts')
      .set('Authorization', g.authHeader).send(content: '12,23,43')
      .end (err, res) ->
        res.should.have.status 400
        done()
      return
