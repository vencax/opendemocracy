// const kalamata = require('kalamata')

module.exports = function (api, g) {
  //
  function _beforeCreate (req, res, next) {
    let val = parseInt(req.body.value)
    let diff = 1
    if (isNaN(val) || !(val === 1 || val === -1)) {
      return next(g.createError('wrong value, must be either 1 or -1'))
    }

    req.body = {
      uid: req.user.id,
      value: req.body.value,
      commentid: req.params.id
    }  // leave only content and add uid

    g.startTransaction(t => {
      function _doUpdateUpDownVotes (fetched, val) {
        const saveOpts = {patch: true, transacting: t}
        if (val === 1) {
          return fetched.save({upvotes: fetched.get('upvotes') + diff}, saveOpts)
        } else {
          return fetched.save({downvotes: fetched.get('downvotes') + diff}, saveOpts)
        }
      }

      let comment = new g.models.Comment({id: req.params.id})
      comment.fetch({transacting: t})
      .then((fetched) => {
        if (!fetched) {
          throw g.createError('not found')
        }
        return g.models.CommentFeedback.where({uid: req.body.uid, commentid: req.params.id}).fetch({transacting: t})
      })
      .then((existingFeedB) => {
        const oposite = val * -1
        if (existingFeedB) {
          if (existingFeedB.get('value') === val) {
            throw g.createError('same feedback already exists')
          }
          if (existingFeedB.get('value') === oposite) { // we are deleting
            val = oposite
            diff = -1
            return existingFeedB.destroy({transacting: t})
          }
        } else {  // save new FB
          return new g.models.CommentFeedback(req.body).save(null, {transacting: t})
        }
      })
      .then(() => {
        return _doUpdateUpDownVotes(comment, val)  // update upvotes/downvotes
      })
      .then(function () {
        t.commit()
        res.status(201).json(req.body)
        next()
      })
      .catch(err => {
        t.rollback(err)
      })
    })
    .catch(next)
  }
  api.post('/:id/feedbacks', g.authMW, _beforeCreate)

  // --------------------------------------------------------------------------

  api.delete('/:id/feedbacks', g.authMW, (req, res, next) => {
    g.startTransaction(t => {
      function _doUpdateUpDownVotes (fetched, val, diff = 1) {
        const saveOpts = {patch: true, transacting: t}
        if (val === 1) {
          return fetched.save({upvotes: fetched.get('upvotes') + diff}, saveOpts)
        } else {
          return fetched.save({downvotes: fetched.get('downvotes') + diff}, saveOpts)
        }
      }

      let comment = new g.models.Comment({id: req.params.id})
      let val
      comment.fetch({transacting: t})
      .then((fetched) => {
        if (!fetched) {
          throw g.createError('not found')
        }
        return g.models.CommentFeedback.where({uid: req.user.id, commentid: req.params.id}).fetch({transacting: t})
      })
      .then((existingFeedB) => {
        if (existingFeedB) {
          val = existingFeedB.get('value')
          return existingFeedB.destroy({transacting: t})
        } else {
          throw g.createError('no feedback to delete')
        }
      })
      .then(() => {
        return _doUpdateUpDownVotes(comment, val, -1)  // update upvotes/downvotes
      })
      .then(function () {
        t.commit()
        res.status(200).json({})
        next()
      })
      .catch(err => {
        t.rollback(err)
      })
    })
    .catch(next)
  })

  // --------------------------------------------------------------------------

  api.get('/:id/feedbacks', g.authMW, (req, res, next) => {
    g.models.CommentFeedback.where({uid: req.user.id, commentid: req.params.id}).fetchAll()
    .then((fetched) => {
      res.json(fetched)
      next()
    })
    .catch(next)
  })
}
