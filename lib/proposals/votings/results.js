const _cache = {}

module.exports = (g) => {
  //
  function _countSingle (casts) {
    const result = {}
    casts.map(i => {
      i.get('content').split(',').map(j => {
        const id = Number(j)
        result[id] = id in result ? result[id] + 1 : 1
      })
    })
    return result
  }

  function _computeResult (proposal) {
    return g.models.Votecast.where({proposalid: proposal.id}).fetchAll()
    .then(casts => {
      return _countSingle(casts)
    })
  }

  return {
    getResultsMW: (req, res, next) => {
      if (req.fetched.get('status') !== 'locked') {
        return next(g.createError('not yet locked'))
      }
      if (req.fetched.id in _cache) {
        return res.json(_cache[req.fetched.id])
      }
      _computeResult(req.fetched)
      .then(result => {
        _cache[req.fetched.id] = result
        res.json(result)
      })
      .catch(next)
    }
  }
}
