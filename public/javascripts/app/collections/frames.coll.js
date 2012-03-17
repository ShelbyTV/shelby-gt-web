// Frames Collection
// ---------------

FramesCollection = Backbone.Collection.extend({

  url : window.shelby.config.apiRoot+'/roll/2/frames.json',

  // Reference to this collection's model (FrameModel).
  model: FrameModel, 

  // Return all frames that have attr : true.
  filterBy: function(attr) {
    return this.filter(function(frame){ return frame.get(attr); });
  },

  comparator: function(frameA, frameB) {
    // Frames are sorted by score - higher scores are vertically higher (a lower collection index) 
    return frameB.get('score') - frameA.get('score');
  }

});
