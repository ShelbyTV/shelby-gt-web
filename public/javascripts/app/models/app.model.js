
AppModel = Backbone.RelationalModel.extend({
  relations : [
    {
      type : Backbone.HasMany,
      key : 'rolls',
      relatedModel : 'RollModel',
      collectionType : 'RollsCollection'
    }
  ],

  initialize : function(){
    this.set('dashboard', new DashboardModel());
    this.get('dashboard').fetch();
  }

});
