// THIS COLLECTION IS FOR TESTING PURPOSES ONLY
FramesNonRelationalCollection = Backbone.Collection.extend({

  url : window.shelby.config.apiRoot+'/roll/2/frames.json',

  // Reference to this collection's model (FrameModel).
  model: FrameNonRelationalModel, 

  comparator: function(frameA, frameB) {
    // Frames are sorted by score - higher scores are vertically higher (a lower collection index) 
    return frameB.get('score') - frameA.get('score');
  }
});
