libs.shelbyGT.UserActivityModel = Backbone.Model.extend({

  // Keeps track of the viewers session activity

  defaults : {
    likeCount : 0,
    rollCount : 0,
    partialWatchCount : 0,
    completeWatchCount : 0
  }

});
