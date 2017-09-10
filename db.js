const Knex = require('knex')
const path = require('path')
const DB_URL = process.env.DATABASE_URL

const commonOpts = {
  migrations: {
    directory: path.join(__dirname, 'migrations')
  },
  seeds: {
    directory: path.join(__dirname, '/seeds')
  }
}
const debugOpts = {
  client: 'sqlite3',
  connection: {
    filename: DB_URL === undefined ? ':memory:' : DB_URL
  },
  useNullAsDefault: true,
  debug: true
}
const productionOpts = {
  client: 'mysql',
  connection: DB_URL
}
let opts = process.env.NODE_ENV === 'production' ? productionOpts : debugOpts
opts = Object.assign(commonOpts, opts)

const knex = Knex(opts)

const bookshelf = require('bookshelf')(knex)

bookshelf.plugin('pagination')

const Proposal = bookshelf.Model.extend({
  tableName: 'proposals',
  feedbacks: function () {
    return this.hasMany(ProposalFeedback, 'proposalid')
  },
  options: function () {
    return this.hasMany(Option, 'proposalid')
  }
})

const ProposalFeedback = bookshelf.Model.extend({
  tableName: 'proposalfeedbacks',
  proposal: function () {
    return this.belongsTo(Proposal, 'proposalid')
  }
})

const Comment = bookshelf.Model.extend({
  tableName: 'comments',
  proposal: function () {
    return this.belongsTo(Proposal, 'parent')
  },
  replies: function () {
    return this.hasMany(Reply, 'commentid')
  },
  feedbacks: function () {
    return this.hasMany(CommentFeedback, 'commentid')
  }
})

const CommentFeedback = bookshelf.Model.extend({
  tableName: 'commentfeedbacks',
  comment: function () {
    return this.belongsTo(Comment, 'commentid')
  }
})

const Reply = bookshelf.Model.extend({
  tableName: 'replies',
  comment: function () {
    return this.belongsTo(Comment, 'commentid')
  }
})

const Voting = bookshelf.Model.extend({
  tableName: 'votings',
  proposal: function () {
    return this.hasOne(Proposal, 'proposalid')
  },
  casts: function () {
    return this.hasMany(Votecast, 'votingid')
  }
})

const Option = bookshelf.Model.extend({
  tableName: 'votoptions',
  proposal: function () {
    return this.belongsTo(Proposal, 'proposalid')
  }
})

const Votecast = bookshelf.Model.extend({
  tableName: 'votcasts',
  voting: function () {
    return this.belongsTo(Voting, 'votingid')
  }
})

knex.models = {
  Proposal: Proposal,
  ProposalFeedback: ProposalFeedback,
  Comment: Comment,
  CommentFeedback: CommentFeedback,
  Reply: Reply,
  Option: Option,
  Voting: Voting,
  Votecast: Votecast
}

module.exports = knex
