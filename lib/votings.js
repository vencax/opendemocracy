const kalamata = require('kalamata')

module.exports = function(api, Voting, createError) {

  const MW = kalamata(Voting, {createError: createError})

  api.get('/', MW.load_q, MW.list)
  api.get('/:id', MW.fetch, MW.detail)

}
