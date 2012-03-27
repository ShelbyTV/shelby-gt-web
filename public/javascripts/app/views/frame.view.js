libs.shelbyGT.FrameView = ListItemView.extend({

  events : {
    "click .js-frame-activate"  : "_activate",
    "click .roll"               : "_goToRoll",
    "click .saves"        : "_saveToWatchLater"
  },

  tagName : 'li',

  className : 'frame',

  template : function(obj){
    return JST['frame'](obj);
  },

  render : function(){
    this.$el.html(this.template({frame : this.model}));
  },

  _activate : function(){
    shelby.models.guide.set('activeFrameModel', this.model);
  },

  _goToRoll : function(){
    shelby.router.navigateToRoll(this.model.get('roll'), {trigger:true});
  },

  _saveToWatchLater : function(){
    // clone the frame and re-roll it to the watch later roll
    var frameToReroll = new libs.shelbyGT.FrameModel();
    frameToReroll.set('original_frame_id', this.model.id);
    frameToReroll.save();
  }

});
