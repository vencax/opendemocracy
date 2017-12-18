const jwt = require('jsonwebtoken')

module.exports = (app, g) => {
  //
  function _testlogin (req, res, next) {
    const token = jwt.sign(req.body, process.env.SERVER_SECRET, {
      expiresIn: '1d'
    })
    res.json({user: req.body, token: token})
  }

  // testing login
  if (process.env.NODE_ENV === 'test') {
    app.post('/login', _testlogin)
  }
}
