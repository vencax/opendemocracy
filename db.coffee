Knex = require('knex')
DB_URL = process.env.DATABASE_URL

debugopts =
  client: 'sqlite3'
  connection:
    filename: if DB_URL then DB_URL else ':memory:'
  useNullAsDefault: true
  debug: true
  migrations:
    directory: __dirname + '/migrations'
  seeds:
    directory: __dirname + '/seeds'

opts =
  client: 'mysql'
  connection: DB_URL

knex = if process.env.NODE_ENV == 'production' then Knex(opts) else Knex(debugopts)
bookshelf = require('bookshelf')(knex)
bookshelf.plugin('pagination')

Proposal = bookshelf.Model.extend
  tableName: 'proposals'
  feedbacks: ()->
    this.hasMany(ProposalFeedback, 'proposalid')
  options: ()->
    this.hasMany(Option, 'proposalid')

ProposalFeedback = bookshelf.Model.extend
  tableName: 'proposalfeedbacks'
  proposal: () ->
    this.belongsTo(Proposal, 'proposalid')

Comment = bookshelf.Model.extend
  tableName: 'comments'
  proposal: () ->
    this.belongsTo(Proposal, 'parent')
  replies: ()->
    this.hasMany(Reply, 'commentid')
  feedbacks: ()->
    this.hasMany(CommentFeedback, 'commentid')

CommentFeedback = bookshelf.Model.extend
  tableName: 'commentfeedbacks'
  comment: () ->
    this.belongsTo(Comment, 'commentid')

Reply = bookshelf.Model.extend
  tableName: 'replies'
  comment: () ->
    this.belongsTo(Comment, 'commentid')

Voting = bookshelf.Model.extend
  tableName: 'votings'
  proposal: () ->
    this.hasOne(Proposal, 'proposalid')
  casts: ()->
    this.hasMany(Votecast, 'votingid')


Option = bookshelf.Model.extend
  tableName: 'votoptions'
  proposal: () ->
    this.belongsTo(Proposal, 'proposalid')

Votecast = bookshelf.Model.extend
  tableName: 'votcasts'
  voting: () ->
    this.belongsTo(Voting, 'votingid')

knex.models =
  Proposal: Proposal
  ProposalFeedback: ProposalFeedback
  Comment: Comment
  CommentFeedback: CommentFeedback
  Reply: Reply
  Option: Option
  Voting: Voting
  Votecast: Votecast


module.exports = knex
