
exports.createProposal = (req, g, p) => {
  Object.assign(p, Object.assign({
    content: `__${p.title} content__`,
    tags: 'tag1'
  }, p))
  return req.post('/proposals').send(p).set('Authorization', g.authHeader)
  .then(function (res) {
    res.should.have.status(201)
    res.should.have.header('content-type', /^application\/json/)
    Object.assign(p, res.body)
    return res.body
  })
}

exports.updateProposal = (g, proposal, change) => {
  return g.db.models.Proposal.forge({id: proposal.id}).fetch()
  .then(fetched => {
    return fetched.save(change, {patch: true})
  })
}
