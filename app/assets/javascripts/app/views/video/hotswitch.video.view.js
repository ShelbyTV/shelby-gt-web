/*
 * Hotswitch view simply display information.  
 * Maintaining hotswitch state is done by the parent, VideoContentPaneView.
 *
 * We do two things to present the correct information:
 *
 * 1) On render() show the currently playing frame as the "endingFrame" and show the nextFrme as "startingFrame"
 * 2) Whenever the currently playing Frame changes, render it as "startingFrame"
 *    - In the normal situation, hotswitching form A to B, this will do nothing (B becomes current frame)
 *    - Also correctly handles the following two situations where the user changes the current video:
 *      a) user changes the current frame before the endingFrame has ended
 *         - state changes to HotswitchVideoStarting and the new startingFrame is corectly rendered as it starts playing
 *      b) user changes the current frame after endingFrame has ended but while we're still on screen
 *         - state remains HotswitchVideoStarting and the new startingFrame correctly replaces whatever's in there
 *
 */
libs.shelbyGT.HotswitchView = Support.CompositeView.extend({

  el: '#js-hotswitch-content-wrapper',

  initialize: function(opts){
    this.options.guide.bind('change:activeFrameModel', this._onActiveFrameModelChange, this);
    Backbone.Events.bind("change:playingFrameGroupCollection", this._onPlayingFrameGroupCollectionChange, this);
  },
  
  _cleanup : function() {
    this.options.guide.unbind('change:activeFrameModel', this._onActiveFrameModelChange, this);
    Backbone.Events.unbind("change:playingFrameGroupCollection", this._onPlayingFrameGroupCollectionChange, this);
  },
  
  template : function(obj) { return SHELBYJST['video/hotswitch-content'](obj); },
  endingFrameTemplate : function(obj) { return SHELBYJST['video/hotswitch-content-ending-frame'](obj); },
  startingFrameTemplate : function(obj) { return SHELBYJST['video/hotswitch-content-starting-frame'](obj); },
  
  render : function() {
    this.$el.html(this.template());
    
    if(this._playingFrameGroupCollection){
      var nextFrame = this._playingFrameGroupCollection.getNextPlayableFrame(this._currentFrame, 1, true);
      this.$el.find("#js-hotswitch-ending-frame").html(this.endingFrameTemplate({endingFrame: this._currentFrame}));
      this.$el.find("#js-hotswitch-starting-frame").html(this.startingFrameTemplate({startingFrame: nextFrame}));
    }
  },
  
  _onActiveFrameModelChange : function(guideModel, activeFrameModel){
    this._currentFrame = activeFrameModel;
    this.$el.find("#js-hotswitch-starting-frame").html(this.startingFrameTemplate({startingFrame: activeFrameModel}));
  },
  
  _onPlayingFrameGroupCollectionChange : function(playingFrameGroupCollection){
    this._playingFrameGroupCollection = playingFrameGroupCollection;
  }
  
});