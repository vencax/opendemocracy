chai = require('chai')
should = chai.should()


module.exports = (g)->

  r = chai.request(g.baseurl)

  describe 'proposalfeedbacks (PF)', ->

    p =
      title: 'prop1'
      content: 'I propose to have a party'

    before ()->
      # prepare proposal
      r.post('/proposals').send(p).set('Authorization', g.authHeader)
      .then (res)->
        res.should.have.status(201)
        res.should.be.json
        res.body.title.should.eql p.title
        res.body.content.should.eql p.content
        p.id = res.body.id

    it 'must NOT create new PF connected to notexistent proposal', (done) ->
      r.post("/proposals/NOTEXISTS/feedbacks").set('Authorization', g.authHeader)
      .send({value: 1})
      .end (err, res) ->
        res.should.have.status(400)
        should.not.exist(res.body.title)
        should.not.exist(res.body.id)
        done()
      return

    it 'must NOT create new PF with wrong value', (done) ->
      r.post("/proposals/#{p.id}/feedbacks").set('Authorization', g.authHeader)
      .send({value: 'wrong'})
      .end (err, res) ->
        res.should.have.status(400)
        should.not.exist(res.body.title)
        should.not.exist(res.body.id)
        done()
      return

    it 'must create new PF', () ->
      r.post("/proposals/#{p.id}/feedbacks").set('Authorization', g.authHeader)
      .send({value: 1})
      .then (res)->
        res.should.have.status(201)
        res.should.be.json
        res.body.proposalid.should.eql p.id
        res.body.uid.should.eql g.loggedUser.id

    it 'must NOT create duplicate PF on same proposal', (done) ->
      r.post("/proposals/#{p.id}/feedbacks").set('Authorization', g.authHeader)
      .send({value: 1})
      .end (err, res)->
        res.should.have.status(400)
        should.not.exist(res.body.title)
        should.not.exist(res.body.id)
        done()
      return

    # not necessaty to test, it is not possible to achieve
    # it 'must NOT delete NOT mine proposal feedback', (done) ->
    #   r.delete("/proposals/#{p.id}/feedbacks")
    #   .set('Authorization', g.authHeader2)
    #   .end (err, res) ->
    #     res.should.have.status(400)
    #     done()

    it 'must delete mine proposal feedback', () ->
      r.delete("/proposals/#{p.id}/feedbacks").set('Authorization', g.authHeader)
      .then (res)->
        res.should.have.status(200)
