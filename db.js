const Knex = require('knex')
const path = require('path')
const Models = require('./models')
const DB_URL = process.env.DATABASE_URL

const commonOpts = {
  migrations: {
    directory: path.join(__dirname, 'migrations')
  },
  seeds: {
    directory: path.join(__dirname, '/seeds')
  }
}
const debugOpts = {
  client: 'sqlite3',
  connection: {
    filename: DB_URL === undefined ? ':memory:' : DB_URL
  },
  useNullAsDefault: true,
  debug: true
}
const productionOpts = {
  client: 'mysql',
  connection: DB_URL
}
let opts = process.env.NODE_ENV === 'production' ? productionOpts : debugOpts
opts = Object.assign(commonOpts, opts)

const knex = Knex(opts)

knex.models = Models(knex)

module.exports = knex
