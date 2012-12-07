libs.shelbyGT.VideoSearchCollection = Backbone.Collection.extend({

  model: libs.shelbyGT.FrameModel,

  parse : function(response) {
    console.log(response);
    return [];
  }

});
