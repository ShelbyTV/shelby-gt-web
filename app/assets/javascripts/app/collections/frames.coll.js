libs.shelbyGT.FramesCollection = Backbone.Collection.extend({

  model: libs.shelbyGT.FrameModel,
  
  comparator : function(frame) {
    // dont compare if result is from search frame
    if (frame.id.split(':').length == 1){
      var ts = new Date( parseInt( frame.id.toString().substring(0,8), 16 ));
      return -ts;
    }
  }

});
