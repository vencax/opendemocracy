exports.up = (knex, Promise) => {
  return Promise.all([
    knex.schema.createTable('votoptions', (table) => {
      table.increments('id')
      table.integer('proposalid').references('proposals.id')
      table.string('title').notNullable()
      table.text('content').notNullable()
    }),
    knex.schema.createTable('votcasts', (table) => {
      table.increments('id')
      table.integer('proposalid').references('proposals.id')
      table.integer('uid').notNullable()
      table.text('content').notNullable()
      table.timestamp('created').notNullable().defaultTo(knex.fn.now())
      table.unique(['proposalid', 'uid'])
    })
  ])
}

exports.down = (knex, Promise) => {
  return Promise.all([
    knex.schema.dropTable('votoptions'),
    knex.schema.dropTable('votcasts')
  ])
}
