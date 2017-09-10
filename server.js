require('dotenv').config()
const port = process.env.PORT || 3000
const app = require('./app')
const db = require('./db')

db.migrate.latest()
.then(() => {
  app.listen(port, function () {
    console.log('gandalf do magic on ' + port)
  })
})
.catch((err) => {
  console.log(err)
})
