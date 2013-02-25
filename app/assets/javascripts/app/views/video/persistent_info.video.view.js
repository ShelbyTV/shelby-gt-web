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
    this.options.playlistManager.bind("change:playlistFrameGroupCollection", this._onplaylistFrameGroupCollectionChange, this);
    shelby.collections.videoSearchResultFrames.bind('add', this.render, this);
    shelby.models.queuedVideos.bind('add:queued_videos', this._onQueuedVideosAdd, this);
    shelby.models.queuedVideos.bind('remove:queued_videos', this._onQueuedVideosRemove, this);
  },

  _cleanup : function() {
    this.options.guide.unbind('change:activeFrameModel', this._onActiveFrameModelChange, this);
    this.options.playlistManager.unbind("change:playlistFrameGroupCollection", this._onplaylistFrameGroupCollectionChange, this);
    shelby.collections.videoSearchResultFrames.unbind('add', this.render, this);
    shelby.models.queuedVideos.unbind('add:queued_videos', this._onQueuedVideosAdd, this);
    shelby.models.queuedVideos.unbind('remove:queued_videos', this._onQueuedVideosRemove, this);
  },

  template : function(obj) {
    try {
      return SHELBYJST['video/persistent-video-info'](obj);
    } catch(e){
      console.log(e.message, e.stack, obj);
    }
  },

  render : function() {
    if(this._currentFrame && this._playlistFrameGroupCollection){
      this._nextFrame = this._playlistFrameGroupCollection.getNextPlayableFrame(this._currentFrame, 1, true);
    }

    if(this._currentFrame && this._nextFrame){
      this.$el.html(this.template({
        currentFrame      : this._currentFrame,
        nextFrame         : this._nextFrame,
        queuedVideosModel : this.options.queuedVideos,
        user              : shelby.models.user
      }));
    }
  },

  _onActiveFrameModelChange : function(guideModel, activeFrameModel){
    this._currentFrame = activeFrameModel;
    this.render();
  },

  _onplaylistFrameGroupCollectionChange : function(playlistManagerModel, playlistFrameGroupCollection){
    this._playlistFrameGroupCollection = playlistFrameGroupCollection;
    this.render();
  },

  _onQueuedVideosAdd : function(video){
    this._onAddRemoveQueuedVideo(video);
  },

  _onQueuedVideosRemove : function(video){
    this._onAddRemoveQueuedVideo(video, true);
  },

  _onAddRemoveQueuedVideo : function(video, removeVideo) {
    if (this._currentFrame) {
      var frameVideo = this._currentFrame.get('video');
      if (frameVideo.id == video.id ||
          (this._currentFrame.get('isSearchResultFrame') && frameVideo.get('provider_id') == video.get('provider_id') && frameVideo.get('provider_name') == video.get('provider_name'))){
        // this video is the one being added/removed
        // in case it got updated from somewhere else like the explore view, update my button
        var $button = this.$('.persistent_video_info__current-frame .js-queue-frame');
        $button.toggleClass('queued', !removeVideo).find('.label').text(!removeVideo ? 'Liked' : 'Like');
        $button.find('i').toggleClass('icon-heart--red', !removeVideo);
      }
    }
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
      frame.like({likeOrigin: 'Persistent Video Info'});
      var $target = $(el.currentTarget);
      $target.toggleClass('queued js-queued').find('.label').text('Liked');
      $target.find('i').addClass('icon-heart--red');
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