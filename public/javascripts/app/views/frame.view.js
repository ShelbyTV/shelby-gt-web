libs.shelbyGT.FrameView = ListItemView.extend({

  events : {
    "click .js-frame-activate"  : "_activate",
    "click .roll"               : "_goToRoll",
    "click .watch-later"        : "_saveToWatchLater"
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
    // var watchLaterRoll = shelby.models.user.getWatchLaterRoll()
    // watchLaterRoll.save(null, {data:{frame_id:this.model.id}});
    // clone the frame and re-roll it to the watch later roll
    var frameToReroll = this.model.clone();
    frameToReroll.set('roll_id', shelby.models.user.getWatchLaterRoll().id);
    frameToReroll.save();
  }

});
