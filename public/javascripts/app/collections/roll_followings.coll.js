libs.shelbyGT.RollFollowingsCollection = Backbone.Collection.extend({

  url : function(){
    return shelby.config.apiRoot + '/user/' + shelby.models.user.id + '/roll_followings';
  },

  model: libs.shelbyGT.RollModel,

  // Return all frames that have attr : true.
  filterBy: function(attr) {
    return this.filter(function(frame){ return frame.get(attr); });
  }

});
