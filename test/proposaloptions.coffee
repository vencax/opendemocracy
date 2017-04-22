chai = require('chai')
should = chai.should()


module.exports = (g)->

  r = chai.request(g.baseurl)

  describe 'proposal options (PO)', ->

    p =
      title: 'prop2'
      content: 'I propose to vote!!'

    opt =
      title: 'Option1'
      content: 'Option1content'

    before ()->
      # prepare proposal
      r.post('/proposals').send(p).set('Authorization', g.authHeader)
      .then (res)->
        res.should.have.status(201)
        res.should.be.json
        res.body.title.should.eql p.title
        res.body.content.should.eql p.content
        p.id = res.body.id

    it 'must create new PO', () ->
      r.post("/proposals/#{p.id}/options").set('Authorization', g.authHeader).send(opt)
      .then (res)->
        res.should.have.status(201)
        res.should.be.json
        res.body.proposalid.should.eql p.id
        res.body.title.should.eql opt.title
        opt.id = res.body.id  # save id

    it 'must update PO', () ->
      r.put("/proposals/#{p.id}/options/#{opt.id}").set('Authorization', g.authHeader)
      .send({title: 'Option1UPDATED'})
      .then (res)->
        res.should.have.status(200)
        res.should.be.json
        res.body[0].title.should.eql 'Option1UPDATED'
        opt.title = 'Option1UPDATED'

    it 'must NOT create new PO connected to notexistent proposal', (done) ->
      r.post("/proposals/NOTEXISTS/options").set('Authorization', g.authHeader)
      .send({value: 1})
      .end (err, res) ->
        res.should.have.status(400)
        should.not.exist(res.body.title)
        should.not.exist(res.body.id)
        done()
      return

    it 'must NOT create new PO when proposal not in draft mode', (done) ->
      r.put("/proposals/#{p.id}").set('Authorization', g.authHeader)
      .send({status: 'discussing'}).end (err, res) ->
        res.should.have.status(200) # changed ..
        r.post("/proposals/#{p.id}/options").set('Authorization', g.authHeader)
        .send(opt).end (err, res) ->
          res.should.have.status(400)
          should.not.exist(res.body.title)
          should.not.exist(res.body.id)
          done()
      return

    it 'must NOT delete NOT mine PO', (done) ->
      r.put("/proposals/#{p.id}").set('Authorization', g.authHeader)
      .send({status: 'draft'}).end (err, res) ->
        res.should.have.status(200) # changed ..
        r.delete("/proposals/#{p.id}/options/#{opt.id}").set('Authorization', g.authHeader2)
        .end (err, res) ->
          res.should.have.status(400)
          done()
      return

    it 'must delete mine PO', () ->
      r.delete("/proposals/#{p.id}/options/#{opt.id}").set('Authorization', g.authHeader)
      .then (res)->
        res.should.have.status(200)
