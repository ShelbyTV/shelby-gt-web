
// Dashboard Entry Model
// ----------

DashboardEntryModel = Backbone.Model.extend({

  initialize : function(attrs){
    if (typeof attrs.frame !== 'FrameModel'){
      var frame = FramesCollection.get(attrs.frame.id);
      if (!frame){
        frame = new FrameModel(attrs.frame);
      }
      this.set('frame', frame);
    } else {
      this.set('frame', attrs.frame);
    }
  }

});
