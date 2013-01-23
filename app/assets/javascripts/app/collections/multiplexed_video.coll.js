libs.shelbyGT.MultiplexedVideoCollection = Backbone.Collection.extend({

  model: libs.shelbyGT.FrameModel,

  initialize: function(){
    this.comparator = function(frame) {
      var ts = new Date( parseInt( frame.id.toString().substring(0,8), 16 ));
      return -ts;
    };
  },

  parse : function(response) {
    return [];
  }
});
