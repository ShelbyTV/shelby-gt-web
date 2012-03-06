// Rolls Collection
// ---------------

RollsCollection = Backbone.Collection.extend({

  // Reference to this collection's model (FrameModel).
  model: RollModel, 

  // Return all frames that have attr : true.
  filterBy: function(attr) {
    return this.filter(function(frame){ return frame.get(attr); });
  }

  /*comparator: function(frameA, frameB) {
    // Frames are sorted by rank - higher scores are vertically higher (a lower collection index) 
    return frameB.get('score') - frameA.get('score');
  }*/

});
