exports.up = (knex, Promise) => {
  return Promise.all([
    knex.schema.createTable('proposals', (table) => {
      table.increments('id')
      table.string('title', 64).notNullable()
      table.integer('uid').notNullable()
      table.text('content').notNullable()
      table.string('tags', 64).notNullable()
      table.integer('comment_count').defaultTo(0)
      // voting attrs
      table.timestamp('votingbegins')
      table.timestamp('votingends')
      table.enu('votingtyp', ['bool', 'singleoption'])
      table.integer('voteforce').notNullable().defaultTo(1)
      table.integer('maxselopts').notNullable().defaultTo(1)

      table.enu('typ', ['proposal'])
      table.enu('status', ['draft', 'discussing', 'thinking', 'voting', 'locked'])
      table.timestamp('laststatuschange')
      table.timestamp('created').notNullable().defaultTo(knex.fn.now())
      table.string('group')  // valid for certain group only
    }),
    knex.schema.createTable('proposalfeedbacks', (table) => {
      table.increments('id')
      table.integer('proposalid').references('proposals.id')
      table.integer('uid').notNullable()
      table.integer('value').notNullable()
      table.timestamp('created').notNullable().defaultTo(knex.fn.now())
      table.unique(['proposalid', 'uid'])
    }),
    knex.schema.createTable('comments', (table) => {
      table.increments('id')
      table.integer('parent').references('proposals.id')
      table.integer('upvotes').notNullable().defaultTo(0)
      table.integer('downvotes').notNullable().defaultTo(0)
      table.integer('uid').notNullable()
      table.text('content').notNullable()
      table.timestamp('created').notNullable().defaultTo(knex.fn.now())
      table.integer('reply_count').defaultTo(0)
    }),
    knex.schema.createTable('commentfeedbacks', (table) => {
      table.increments('id')
      table.integer('uid').notNullable()
      table.integer('commentid').references('comments.id')
      table.integer('value').notNullable()
      table.unique(['commentid', 'uid'])
    }),
    knex.schema.createTable('replies', (table) => {
      table.increments('id')
      table.integer('commentid').references('comments.id')
      table.integer('uid').notNullable()
      table.text('content').notNullable()
      table.timestamp('created').notNullable().defaultTo(knex.fn.now())
    })
  ])
}

exports.down = (knex, Promise) => {
  return Promise.all([
    knex.schema.dropTable('proposals'),
    knex.schema.dropTable('proposalfeedbacks'),
    knex.schema.dropTable('comments'),
    knex.schema.dropTable('commentfeedbacks'),
    knex.schema.dropTable('replies')
  ])
}
