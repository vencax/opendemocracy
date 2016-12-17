
require('coffee-script/register')
var port = process.env.PORT || 3000
var app = require('./app')

app.listen(port, function() {
  console.log('gandalf do magic on ' + port)
})
