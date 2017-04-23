
chai = require('chai')
moment = require('moment')
should = chai.should()

module.exports = (g)->

  r = chai.request(g.baseurl)

  describe 'votings', ->

    voting =
      begins: moment().subtract('days', 1).toDate()
      ends:  moment().add('days', 1).toDate()

    p =
      title: 'prop3'
      content: 'I propose to vote pirates!!'

    opts = [
      {title: 'opt1', content: 'op1cont'}
      {title: 'opt2', content: 'op2cont'}
      {title: 'opt3', content: 'op3cont'}
    ]

    before ()->
      # prepare data
      r.post('/proposals').send(p).set('Authorization', g.authHeader)
      .then (res)->
        res.should.have.status(201)
        voting.proposalid = p.id = res.body.id
        newvoting = new g.db.models.Voting(voting)
        newvoting.save()
      .then (saved) ->
        voting = saved
        r.post("/proposals/#{p.id}/options")
        .set('Authorization', g.authHeader).send(opts[0])
      .then (res)->
        res.should.have.status(201)
        opts[0].id = res.body.id
        r.post("/proposals/#{p.id}/options")
        .set('Authorization', g.authHeader).send(opts[1])
      .then (res)->
        res.should.have.status(201)
        opts[1].id = res.body.id
        r.post("/proposals/#{p.id}/options")
        .set('Authorization', g.authHeader).send(opts[2])
      .then (res)->
        res.should.have.status(201)
        opts[2].id = res.body.id

    it 'must list all votings', () ->
      r.get("/votings").set('Authorization', g.authHeader).then (res) ->
        res.should.have.status(200)

    it 'must cast a vote', () ->
      r.post("/votings/#{voting.id}/casts").set('Authorization', g.authHeader)
      .send(content: "#{opts[0].id},#{opts[2].id}")
      .then (res) ->
        res.should.have.status(201)

    it 'must update a cast', () ->
      r.put("/votings/#{voting.id}/casts").set('Authorization', g.authHeader)
      .send(content: opts[1].id)
      .then (res) ->
        res.should.have.status(200)

    it 'must delete a cast', () ->
      r.delete("/votings/#{voting.id}/casts").set('Authorization', g.authHeader)
      .then (res) ->
        res.should.have.status(200)

    it 'must NOT cast a vote with not existing options', (done) ->
      r.post('/votings/' + voting.id + '/casts')
      .set('Authorization', g.authHeader).send(content: '123,34242')
      .end (err, res) ->
        res.should.have.status 400
        done()
      return

    it 'must change the voting window to future', () ->
      item = new (g.db.models.Voting)(id: voting.id)
      return item.fetch().then (fetched) ->
        fetched.set
          begins: moment().add('days', 10).toDate()
          ends: moment().add('days', 11).toDate()
        return fetched.save()

    it 'must NOT cast a vote before voting begins', (done) ->
      r.post('/votings/' + voting.id + '/casts')
      .set('Authorization', g.authHeader).send(content: opts[0].id)
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
      .set('Authorization', g.authHeader).send(content: opts[0].id)
      .end (err, res) ->
        res.should.have.status 400
        done()
      return
