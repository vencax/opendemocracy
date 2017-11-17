exports.up = (knex, Promise) => {
  return Promise.all([
    knex.schema.createTable('users', (table) => {
      table.increments('id')
      table.string('fullname', 64).notNullable()
      table.string('email', 64).notNullable()
      table.string('passwd', 64).notNullable()
    })
  ])
}

exports.down = (knex, Promise) => {
  return Promise.all([
    knex.schema.dropTable('users')
  ])
}
