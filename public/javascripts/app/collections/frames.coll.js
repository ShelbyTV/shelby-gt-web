// Frames Collection
// ---------------

FramesCollection = Backbone.Collection.extend({

  model: libs.shelbyGT.FrameModel,

  // Return all frames that have attr : true.
  filterBy: function(attr) {
    return this.filter(function(frame){ return frame.get(attr); });
  },
});
