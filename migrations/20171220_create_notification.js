exports.up = (knex, Promise) => {
  return Promise.all([
    knex.schema.createTable('notifications', (table) => {
      table.increments('id')
      table.enu('evt', ['propsuport', 'newvoting'])
      table.integer('objid').notNullable()
      table.string('title', 64).notNullable()
      table.string('group', 64)
      table.timestamp('created').notNullable().defaultTo(knex.fn.now())
    }),
    knex.schema.createTable('seennotifications', (table) => {
      table.increments('id')
      table.integer('notificationid').references('notifications.id')
      table.integer('uid')
      table.unique(['notificationid', 'uid'])
    })
  ])
}

exports.down = (knex, Promise) => {
  return Promise.all([
    knex.schema.dropTable('notifications'),
    knex.schema.dropTable('seennotifications')
  ])
}
