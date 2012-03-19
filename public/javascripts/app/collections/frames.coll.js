// Frames Collection
// ---------------

FramesCollection = Backbone.Collection.extend({

  // Reference to this collection's model (FrameModel).
  model: FrameModel, 

  // Return all frames that have attr : true.
  filterBy: function(attr) {
    return this.filter(function(frame){ return frame.get(attr); });
  },
});
