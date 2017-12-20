/* global describe it */
const chai = require('chai')
// const should = chai.should()

module.exports = function (g) {
  //
  const r = chai.request(g.baseurl)

  return describe('notifications', function () {
    //
    it('must list', function () {
      return r.get(`/notifications/`).set('Authorization', g.authHeader)
      .then(function (res) {
        res.should.have.status(200)
      })
    })
  })
}
