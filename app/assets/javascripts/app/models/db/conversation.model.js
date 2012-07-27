libs.shelbyGT.ConversationModel = libs.shelbyGT.ShelbyBaseModel.extend({
  relations : [{
      type : Backbone.HasMany,
      key : 'messages',
      relatedModel : 'libs.shelbyGT.MessageModel'
  }]
  
});
