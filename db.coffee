Knex = require('knex')

debugopts =
  client: 'sqlite3'
  connection:
    filename: ':memory:'
  useNullAsDefault: true
  debug: true
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
  feedbacks: ()->
    this.hasMany(ProposalFeedback, 'proposalid')

ProposalFeedback = bookshelf.Model.extend
  tableName: 'proposalfeedbacks'
  proposal: () ->
    this.belongsTo(Proposal, 'proposalid')

Comment = bookshelf.Model.extend
  tableName: 'comments'
  proposal: () ->
    this.belongsTo(Proposal, 'parent')

CommentFeedback = bookshelf.Model.extend
  tableName: 'commentfeedbacks'
  comment: () ->
    this.belongsTo(Comment, 'commentid')

Reply = bookshelf.Model.extend
  tableName: 'replies'
  comment: () ->
    this.belongsTo(Comment, 'commentid')

knex.models =
  Proposal: Proposal
  ProposalFeedback: ProposalFeedback
  Comment: Comment
  CommentFeedback: CommentFeedback
  Reply: Reply

module.exports = knex
