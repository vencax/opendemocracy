exports.up = (knex, Promise) ->
  return knex.schema.createTable 'votings', (table)->
    table.increments('id')
    table.integer('proposalid').references('proposals.id')
    table.timestamp('begins').notNullable()
    table.timestamp('ends').notNullable()
    table.timestamp('created').notNullable().defaultTo(knex.fn.now())
  .then ()->
    knex.schema.createTable 'votoptions', (table)->
      table.increments('id')
      table.integer('proposalid').references('proposals.id')
      table.string('title').notNullable()
      table.text('content').notNullable()
  .then ()->
    knex.schema.createTable 'votcasts', (table)->
      table.increments('id')
      table.integer('optionid').references('votoptions.id')
      table.integer('uid').notNullable()


exports.down = (knex, Promise) ->
  return knex.schema.dropTable('votings')
  .then ()->
    knex.schema.dropTable('votoptions')
  .then ()->
    knex.schema.dropTable('votcasts')
