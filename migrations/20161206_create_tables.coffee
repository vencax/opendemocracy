exports.up = (knex, Promise) ->
  return knex.schema.createTable 'proposals', (table)->
    table.increments('id')
    table.string('title').notNullable()
    table.integer('author').notNullable() # human readadble author
    table.integer('uid').notNullable()
    table.text('content').notNullable()
    table.enu('votingtyp', ['bool', 'singleoption'])
    table.integer('voteforce').notNullable().defaultTo(1)
    table.enu('typ', ['proposal'])
    table.enu('status', ['draft', 'discussing', 'voting', 'locked'])
    table.timestamp('created').notNullable().defaultTo(knex.fn.now())
  .then ()->
    knex.schema.createTable 'proposalfeedbacks', (table)->
      table.increments('id')
      table.integer('proposalid').references('proposals.id')
      table.integer('uid').notNullable()
      table.integer('value').notNullable()
      table.timestamp('created').notNullable().defaultTo(knex.fn.now())
      table.unique(['proposalid', 'uid'])
  .then ()->
    knex.schema.createTable 'comments', (table)->
      table.increments('id')
      table.integer('parent').references('proposals.id')
      table.integer('upvotes').notNullable().defaultTo(0)
      table.integer('downvotes').notNullable().defaultTo(0)
      table.integer('uid').notNullable()
      table.text('content').notNullable()
      table.timestamp('created').notNullable().defaultTo(knex.fn.now())
      # "reply_count": 2,
  .then ()->
    knex.schema.createTable 'commentfeedbacks', (table)->
      table.increments('id')
      table.integer('uid').notNullable()
      table.integer('commentid').references('comments.id')
      table.integer('value').notNullable()
      table.unique(['commentid', 'uid'])
  .then ()->
    knex.schema.createTable 'replies', (table)->
      table.increments('id')
      table.integer('commentid').references('comments.id')
      table.integer('uid').notNullable()
      table.text('content').notNullable()
      table.timestamp('created').notNullable().defaultTo(knex.fn.now())


exports.down = (knex, Promise) ->
  return knex.schema.dropTable('proposals')
  .then ()->
    knex.schema.dropTable('proposalfeedbacks')
  .then ()->
    knex.schema.dropTable('comments')
  .then ()->
    knex.schema.dropTable('commentfeedbacks')
  .then ()->
    knex.schema.dropTable('replies')