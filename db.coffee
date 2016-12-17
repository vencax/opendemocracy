Knex = require('knex')

debugopts =
  client: 'sqlite3'
  connection:
    filename: ':memory:'
  # debug: true
  migrations:
    directory: __dirname + '/migrations'
  seeds:
    directory: __dirname + '/seeds'

opts =
  client: 'mysql'
  connection: process.env.DATABASE_URL

knex = if process.env.NODE_ENV == 'production' then Knex(opts) else Knex(debugopts)
bookshelf = require('bookshelf')(knex)

Proposal = bookshelf.Model.extend
  tableName: 'proposals'
ProposalFeedback = bookshelf.Model.extend
  tableName: 'proposalfeedback'
Comment = bookshelf.Model.extend
  tableName: 'comments'
CommentFeedback = bookshelf.Model.extend
  tableName: 'commentfeedbacks'
Reply = bookshelf.Model.extend
  tableName: 'replies'

knex.models =
  Proposal: Proposal
  ProposalFeedback: ProposalFeedback
  Comment: Comment
  CommentFeedback: CommentFeedback
  Reply: Reply

module.exports = knex
