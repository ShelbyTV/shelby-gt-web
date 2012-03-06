
AppModel = Backbone.RelationalModel.extend({
  relations : [
    {
      type : Backbone.HasOne,
      key : 'dashboard',
      relatedModel : 'DashboardModel'
    },{
      type : Backbone.HasMany,
      key : 'rolls',
      relatedModel : 'RollModel',
      collectionType : 'RollsCollection'
    }
  ]
});
