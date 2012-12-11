libs.shelbyGT.MultiplexedVideoCollection = Backbone.Collection.extend({

  model: libs.shelbyGT.FrameModel,

  parse : function(response) {
    console.log(response);
    return [];
  }

});
