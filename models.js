
module.exports = (bookshelf) => {
  //
  const Proposal = bookshelf.Model.extend({
    tableName: 'proposals',
    feedbacks: function () {
      return this.hasMany(ProposalFeedback, 'proposalid')
    },
    options: function () {
      return this.hasMany(Option, 'proposalid')
    },
    casts: function () {
      return this.hasMany(Votecast, 'proposalid')
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

  const Option = bookshelf.Model.extend({
    tableName: 'votoptions',
    proposal: function () {
      return this.belongsTo(Proposal, 'proposalid')
    }
  })

  const Votecast = bookshelf.Model.extend({
    tableName: 'votcasts',
    voting: function () {
      return this.belongsTo(Proposal, 'proposalid')
    }
  })

  const User = bookshelf.Model.extend({
    tableName: 'users'
  })

  const models = {
    Proposal: Proposal,
    ProposalFeedback: ProposalFeedback,
    Comment: Comment,
    CommentFeedback: CommentFeedback,
    Reply: Reply,
    Option: Option,
    Votecast: Votecast
  }

  return Object.assign(models, {User: User})
}
