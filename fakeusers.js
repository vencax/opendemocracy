const jwt = require('jsonwebtoken')
const db = require('./db')
const User = db.models.User

module.exports = (app, createError) => {
  //
  function _mockLogin (req, res, next) {
    function _send (user) {
      const token = jwt.sign(user, process.env.SERVER_SECRET, {
        expiresIn: '1d'
      })
      res.json({user: user, token: token})
    }
    const u = new User({email: req.body.email})
    u.fetch()
    .then((existing) => {
      if (existing) {
        if (existing.get('passwd') !== req.body.passwd) {
          return next(createError('wrong kredenc'))
        } else {
          return _send(existing.toJSON())
        }
      } else {
        u.set('fullname', 'Full' + req.body.email)
        u.set('passwd', req.body.passwd)
        return u.save()
      }
    })
    .then((created) => {
      created && _send(created.toJSON())
    })
    .catch(next)
  }

  function _testlogin (req, res, next) {
    const token = jwt.sign(req.body, process.env.SERVER_SECRET, {
      expiresIn: '1d'
    })
    res.json({user: req.body, token: token})
  }

  // testing login
  if (process.env.NODE_ENV === 'test') {
    app.post('/login', _testlogin)
  } else {
    // fake mock login
    app.post('/login', _mockLogin)
  }

  app.get('/userinfo/:uid', (req, res, next) => {
    new User({id: req.params.uid}).fetch()
    .then((existing) => {
      if (!existing) {
        return next(createError(404, 'not founda'))
      }
      existing = existing.toJSON()
      delete existing.passwd
      res.json(existing)
    })
    .catch(next)
  })
}
