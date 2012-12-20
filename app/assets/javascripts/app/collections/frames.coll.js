libs.shelbyGT.FramesCollection = Backbone.Collection.extend({

  model: libs.shelbyGT.FrameModel,
  
  comparator : function(frame) {
    var ts = new Date( parseInt( frame.id.toString().substring(0,8), 16 ));
    return -ts;
  }

});
