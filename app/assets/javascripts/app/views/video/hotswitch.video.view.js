/*
 * Hotswitch view simplys display information and routes frame actions.
 * Maintaining hotswitch state is done by the parent, VideoContentPaneView.
 *
 * Terminology: "endingFrame" is currently playing or nearing its end on hotswitch initiation
 *              "startingFrame" is up next, or currently playing if we've alread switched
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
  
  events : {
    "click .hotswitch-ending-frame .js-roll-frame"    : "_requestEndingFrameRollView",
    "click .hotswitch-starting-frame .js-roll-frame"  : "_requestStartingFrameRollView",
    "click .hotswitch-ending-frame .js-share-frame"   : "_requestEndingFrameShareView",
    "click .hotswitch-starting-frame .js-share-frame" : "_requestStartingFrameShareView",
    "click .hotswitch-ending-frame .js-queue-frame:not(.queued)"    : "_queueEndingFrame",
    "click .hotswitch-starting-frame .js-queue-frame:not(.queued)"  : "_queueStartingFrame"
  },

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
      this._endingFrame = this._currentFrame;
      this._startingFrame = this._playingFrameGroupCollection.getNextPlayableFrame(this._currentFrame, 1, true);
      this.$("#js-hotswitch-ending-frame").html(this.endingFrameTemplate({endingFrame: this._endingFrame, queuedVideosModel: this.options.queuedVideos}));
      this.$("#js-hotswitch-starting-frame").html(this.startingFrameTemplate({startingFrame: this._startingFrame, queuedVideosModel: this.options.queuedVideos}));
    }
  },
  
  _onActiveFrameModelChange : function(guideModel, activeFrameModel){
    this._currentFrame = activeFrameModel;
    this._startingFrame = activeFrameModel;
    this.$("#js-hotswitch-starting-frame").html(this.startingFrameTemplate({startingFrame: activeFrameModel, queuedVideosModel: this.options.queuedVideos}));
  },
  
  _onPlayingFrameGroupCollectionChange : function(playingFrameGroupCollection){
    this._playingFrameGroupCollection = playingFrameGroupCollection;
  },
  
  /*************************************************************
   * Button events
   *************************************************************/
  _requestEndingFrameRollView : function(){ this._requestFrameRollView(this._endingFrame); },
  _requestStartingFrameRollView : function(){ this._requestFrameRollView(this._startingFrame); },
  _requestFrameRollView : function(frame){
    if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.ROLL) ){
      this.options.guideOverlayModel.switchOrHideOverlay(libs.shelbyGT.GuideOverlayType.rolling, frame);
    }
  },
  
  _requestEndingFrameShareView : function(){ this._requestFrameShareView(this._endingFrame); },
  _requestStartingFrameShareView : function(){ this._requestFrameShareView(this._startingFrame); },
  _requestFrameShareView: function(frame){
    if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.COMMENT) ){
      this.options.guideOverlayModel.switchOrHideOverlay(libs.shelbyGT.GuideOverlayType.share, frame);
    }
  },
  
  _queueEndingFrame : function(el){ this._queueFrame(this._endingFrame, el); },
  _queueStartingFrame : function(el){ this._queueFrame(this._endingFrame, el); },
  _queueFrame : function(frame, el){
    if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.QUEUE) ){
      frame.saveToWatchLater();
      $(el.currentTarget).toggleClass('button_gray-light queued js-queued').find('.js-command-icon').text('Queued');
    }
  }
  
});