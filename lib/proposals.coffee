
module.exports = (api, Proposal) ->

  api.expose(Proposal)

  api.beforeCreateProposal (req, res, proposal) ->
    proposal.set('author', req.user.id)
    proposal.set('status', 'draft')

  api.beforeUpdateProposal (req, res, proposal) ->
    if(req.user.id != proposal.get('author'))
      res.status(400).send('not mine')

  api.beforeDeleteProposal (req, res, proposal) ->
    if(req.user.id != proposal.get('author'))
      return res.status(400).send('not mine')
    if(proposal.get('status') != 'draft')
      return res.status(400).send('cannot delete non draft proposal')

  api.afterDeleteProposal (req, res, proposal) ->
    res.status(200).json({})
