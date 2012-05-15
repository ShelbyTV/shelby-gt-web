libs.shelbyGT.RollFollowingsCollection = Backbone.Collection.extend({

  // Return all frames that have attr : true.
  filterBy: function(attr) {
    return this.filter(function(frame){ return frame.get(attr); });
  }

});
