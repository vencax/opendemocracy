exports.up = (knex, Promise) => {
  return Promise.all([
    knex.schema.createTable('votings', (table) => {
      table.increments('id')
      table.integer('proposalid').references('proposals.id')
      table.timestamp('begins').notNullable()
      table.timestamp('ends').notNullable()
      table.timestamp('created').notNullable().defaultTo(knex.fn.now())
    }),
    knex.schema.createTable('votoptions', (table) => {
      table.increments('id')
      table.integer('proposalid').references('proposals.id')
      table.string('title').notNullable()
      table.text('content').notNullable()
    }),
    knex.schema.createTable('votcasts', (table) => {
      table.increments('id')
      table.integer('votingid').references('votings.id')
      table.integer('uid').notNullable()
      table.text('content').notNullable()
      table.timestamp('created').notNullable().defaultTo(knex.fn.now())
    })
  ])
}

exports.down = (knex, Promise) => {
  return Promise.all([
    knex.schema.dropTable('votings'),
    knex.schema.dropTable('votoptions'),
    knex.schema.dropTable('votcasts')
  ])
}
