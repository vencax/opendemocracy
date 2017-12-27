exports.up = (knex, Promise) => {
  return Promise.all([
    knex.schema.createTable('notifications', (table) => {
      table.increments('id')
      table.enu('evt', ['propsuport'])
      table.integer('objid').notNullable()
      table.string('title', 64).notNullable()
      table.string('group', 64)
      table.timestamp('created').notNullable().defaultTo(knex.fn.now())
    }),
    knex.schema.createTable('seennotifications', (table) => {
      table.integer('notificationid').references('notifications.id')
      table.integer('uid')
      table.primary(['notificationid', 'uid'])
    })
  ])
}

exports.down = (knex, Promise) => {
  return Promise.all([
    knex.schema.dropTable('notifications'),
    knex.schema.dropTable('seennotifications')
  ])
}
