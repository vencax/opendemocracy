exports.up = (knex, Promise) => {
  return Promise.all([
    knex.schema.createTable('notifications', (table) => {
      table.increments('id')
      table.enu('evt', ['propsuport'])
      table.integer('objid').notNullable()
      table.string('title', 64).notNullable()
      table.timestamp('created').notNullable().defaultTo(knex.fn.now())
    })
  ])
}

exports.down = (knex, Promise) => {
  return Promise.all([
    knex.schema.dropTable('notifications')
  ])
}
