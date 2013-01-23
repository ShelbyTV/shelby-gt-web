/*
 *
 * Display information about the current video and the next video across the bottom of the video player area.
 *
 */
libs.shelbyGT.PersistentVideoInfoView = Support.CompositeView.extend({

  events : {
    "click .persistent_video_info__current-frame  .js-roll-frame"                 : "_requestCurrentFrameRollView",
    "click .persistent_video_info__next-frame     .js-roll-frame"                 : "_requestNextFrameRollView",
    "click .persistent_video_info__current-frame  .js-share-frame"                : "_requestCurrentFrameShareView",
    "click .persistent_video_info__next-frame     .js-share-frame"                : "_requestNextFrameShareView",
    "click .persistent_video_info__current-frame  .js-queue-frame:not(.queued)"   : "_queueCurrentFrame",
    "click .persistent_video_info__next-frame     .js-queue-frame:not(.queued)"   : "_queueNextFrame",
    "click .persistent_video_info__current-frame  .js-comment-frame"              : "_commentCurrentFrame",
    "click .persistent_video_info__next-frame     .js-comment-frame"              : "_commentNextFrame",
    "click .persistent_video_info__current-frame  .js-facebook-share"             : "_shareCurrentToFacebook",
    "click .js-next-video"                                                        : "_skipToNextVideo"
  },

  initialize: function(opts){
    this._userDesires = opts.userDesires;

    this.options.guide.bind('change:activeFrameModel', this._onActiveFrameModelChange, this);
    this.options.playlistManager.bind("change:playingFrameGroupCollection", this._onPlayingFrameGroupCollectionChange, this);
    shelby.collections.videoSearchResultFrames.bind('add', this.render, this);
  },

  _cleanup : function() {
    this.options.guide.unbind('change:activeFrameModel', this._onActiveFrameModelChange, this);
    this.options.playlistManager.unbind("change:playingFrameGroupCollection", this._onPlayingFrameGroupCollectionChange, this);
    shelby.collections.videoSearchResultFrames.unbind('add', this.render, this);
  },

  template : function(obj) {
    try {
      return SHELBYJST['video/persistent-video-info'](obj);
    } catch(e){
      console.log(e.message, e.stack, obj);
    }
  },

  render : function() {
    if(this._currentFrame && this._playingFrameGroupCollection){
      this._nextFrame = this._playingFrameGroupCollection.getNextPlayableFrame(this._currentFrame, 1, true);
    }

    if(this._currentFrame && this._nextFrame){
      this.$el.html(this.template({
        currentFrame: this._currentFrame,
        nextFrame: this._nextFrame,
        queuedVideosModel: this.options.queuedVideos,
        user: shelby.models.user
      }));
    }
  },

  _onActiveFrameModelChange : function(guideModel, activeFrameModel){
    this._currentFrame = activeFrameModel;
    this.render();
  },

  _onPlayingFrameGroupCollectionChange : function(playlistManagerModel, playingFrameGroupCollection){
    this._playingFrameGroupCollection = playingFrameGroupCollection;
    this.render();
  },

  /*************************************************************
   * Button events
   *************************************************************/
  _requestCurrentFrameRollView : function(){
    this._requestFrameRollView(this._currentFrame);
  },

  _requestNextFrameRollView : function(){
    this._requestFrameRollView(this._nextFrame);
  },

  _requestFrameRollView : function(frame){
    if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.ROLL) ){
      this.options.guideOverlayModel.switchOrHideOverlay(libs.shelbyGT.GuideOverlayType.rolling, frame);
    }
  },

  _requestCurrentFrameShareView : function(){
    if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.ROLL) ){
      this._requestFrameShareView(this._currentFrame);
    }
  },

  _requestNextFrameShareView : function(){
    if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.ROLL) ){
      this._requestFrameShareView(this._nextFrame);
    }
  },

  _requestFrameShareView: function(frame){
    if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.COMMENT) ){
      this.options.guideOverlayModel.switchOrHideOverlay(libs.shelbyGT.GuideOverlayType.share, frame);
    }
  },

  _queueCurrentFrame : function(el){
    this._queueFrame(this._currentFrame, el);
  },

  _queueNextFrame : function(el){
    this._queueFrame(this._nextFrame, el);
  },

  _queueFrame : function(frame, el){
    if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.QUEUE) ){
      frame.saveToWatchLater();
      $(el.currentTarget).toggleClass('queued js-queued').text('Queued');
    }
  },

  _commentCurrentFrame : function(el){
    this._commentFrame(this._currentFrame, el);
  },

  _commentNextFrame : function(el){
    this._commentFrame(this._nextFrame, el);
  },

  _commentFrame : function(frame, el){
    //comment frame func
    this.options.guideOverlayModel.switchOrHideOverlay(libs.shelbyGT.GuideOverlayType.conversation, frame);
  },

  _skipToNextVideo : function(){
    this._userDesires.set('changeVideo', 1);
    this._userDesires.unset('changeVideo');
  },

  _shareCurrentToFacebook : function(e){
    var _frame = this._currentFrame;
    if (typeof FB != "undefined"){
      FB.ui(
        {
          method: 'feed',
          name: _frame.get('video').get('title'),
          link: _frame.getSubdomainPermalink(),
          picture: _frame.get('video').get('thumbnail_url'),
          description: _frame.get('video').get('description'),
          caption: 'a video from '+ shelby.config.hostName
        },
        function(response) {
          if (response && response.post_id) {
            // TODO:we should record that this happened.
          }
        }
      );
    }
  }

});