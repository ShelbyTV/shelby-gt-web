FrameModel = Backbone.RelationalModel.extend({

  relations : [
    {
      type : Backbone.HasOne,
      key : 'creator',
      relatedModel : 'UserModel'
    },{
      type : Backbone.HasOne,
      key : 'conversation', 
      relatedModel : 'ConversationModel'
    },{
      type : Backbone.HasOne,
      key : 'video',
      relatedModel : 'VideoModel'
    },{
      type : Backbone.HasOne,
      key : 'roll',
      relatedModel : 'RollModel'
    }
  ]

});
