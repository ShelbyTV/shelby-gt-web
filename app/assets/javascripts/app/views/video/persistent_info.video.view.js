/*
 *
 * Display information about the current video and the next video across the bottom of the video player area.
 *
 */
libs.shelbyGT.PersistentVideoInfoView = Support.CompositeView.extend({

  _currentFrameShortlink : null,

  options : {
    eventTrackingCategory : 'Persistent Video Info' // what category events in this view will be tracked under
  },

  events : {
    "click .persistent_video_info__current-frame  .js-roll-frame"                 : "_requestCurrentFrameRollView",
    "click .persistent_video_info__next-frame     .js-roll-frame"                 : "_requestNextFrameRollView",
    "click .js-button_share--email"                                               : "_requestCurrentFrameShareView",
    "click .persistent_video_info__current-frame  .js-share-frame"                : "_requestCurrentFrameShareView",
    "click .persistent_video_info__next-frame     .js-share-frame"                : "_requestNextFrameShareView",
    "click .persistent_video_info__current-frame  .js-queue-frame:not(.queued)"   : "_queueCurrentFrame",
    "click .persistent_video_info__next-frame     .js-queue-frame:not(.queued)"   : "_queueNextFrame",
    "click .persistent_video_info__current-frame  .js-comment-frame"              : "_commentCurrentFrame",
    "click .persistent_video_info__next-frame     .js-comment-frame"              : "_commentNextFrame",
    "click .persistent_video_info__current-frame  .js-facebook-share"             : "_shareCurrentToFacebook",
    "click .js-button_share--facebook"                                            : "_shareCurrentToFacebook",
    "click .js-next-video"                                                        : "_skipToNextVideo",
    "click .js-toggle-comment"                                                    : "_toggleComment",
    "click .js-share-menu"                                                        : "_toggleShareMenu",
    "click .js-hide-share-menu"                                                   : "_toggleShareMenu",
    "click .js-frame-shortlink"                                                   : "_selectShortLinkText"
  },

  initialize: function(){
    this._currentFrame = this.options.guide.get('activeFrameModel');
    this._playlistFrameGroupCollection = this.options.playlistManager.get('playlistFrameGroupCollection');

    this.options.guide.bind('change:activeFrameModel', this._onActiveFrameModelChange, this);
    this.options.playlistManager.bind("change:playlistFrameGroupCollection", this._onplaylistFrameGroupCollectionChange, this);
    //TODO : figure out why we have this binding
    shelby.collections.videoSearchResultFrames.bind('add', this.render, this);
    shelby.models.queuedVideos.bind('add:queued_videos', this._onQueuedVideosAdd, this);
    shelby.models.queuedVideos.bind('remove:queued_videos', this._onQueuedVideosRemove, this);

    this.render();
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
      var emailBody;
      var tweetIntentParams = {};
      if (shelby.models.user.isAnonymous()) {
        var permalink = libs.shelbyGT.viewHelpers.frame.permalink(this._currentFrame);
        // check if there is a special configuration for frame's roll's creator
        var rollCreatorId = this._currentFrame.has('roll') && this._currentFrame.get('roll').has('creator_id') && this._currentFrame.get('roll').get('creator_id');
        var specialConfig = _(shelby.config.dotTvNetworks.dotTvCuratorSpecialConfig).findWhere({id: rollCreatorId});

        // if there is a special message for the anonymous email share, use it
        if (specialConfig && specialConfig.customShareMessages && specialConfig.customShareMessages.email) {
          emailBody = _.template(specialConfig.customShareMessages.email, {
            link : permalink + "?utm_campaign=email-share"
          });
        } else {
          //if not, just use the permalink as the entire email message
          emailBody = permalink + "?utm_campaign=email-share";
        }

        // if there is a special message for the twitter text, use it
        if (specialConfig && specialConfig.customShareMessages && specialConfig.customShareMessages.twitter) {
          tweetIntentParams = {
            text : _.template(specialConfig.customShareMessages.twitter, {link : permalink})
          };
        } else {
          //if not, use the default twitter message
          tweetIntentParams = {
            text : 'Check out this video',
            url : permalink
          };
        }
      }

      this.$el.html(this.template({
        anonUserShareEmailBody : emailBody,
        tweetIntentQueryString : $.param(tweetIntentParams),
        currentFrame           : this._currentFrame,
        eventTrackingCategory  : this.options.eventTrackingCategory,
        nextFrame              : this._nextFrame,
        queuedVideosModel      : this.options.queuedVideos,
        showNextFrame          : this.options.showNextFrame,
        user                   : shelby.models.user
      }));
    }
  },

  _onActiveFrameModelChange : function(guideModel, activeFrameModel){
    this._currentFrame = activeFrameModel;
    // current frame changed, so we don't have the right shortlink anymore
    this._currentFrameShortlink = null;
    this.render();
  },

  _onplaylistFrameGroupCollectionChange : function(playlistManagerModel, playlistFrameGroupCollection){
    this._playlistFrameGroupCollection = playlistFrameGroupCollection;
    //TODO : the menu should stay open and we don't need to reload the shortlink
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
        // in case it got updated from somewhere else, update my button
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
      frame.like({likeOrigin: this.options.eventTrackingCategory});
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
    this.options.userDesires.set('changeVideo', 1);
    this.options.userDesires.unset('changeVideo');
  },

  _shareCurrentToFacebook : function(e){
    var _frame = this._currentFrame;
    var _caption;
    if (shelby.config.hostName) {
      _caption = 'a video from '+shelby.config.hostname;
    } else if (_frame.has('roll')) {
      if (_frame.get('roll').has('subdomain')) {
        _caption = 'a video from '+_frame.get('roll').get('subdomain')+'.shelby.tv';
      } else {
        _caption = 'a video from shelby.tv';
      }
    }
    else {
      _caption = 'a video found with Shelby Video Search';
    }
    if (typeof FB != "undefined"){
      FB.ui(
        {
          method: 'feed',
          name: _frame.get('video').get('title'),
          link: libs.shelbyGT.viewHelpers.frame.permalink(_frame),
          picture: _frame.get('video').get('thumbnail_url'),
          description: _frame.get('video').get('description'),
          caption: _caption
        },
        function(response) {
          if (response && response.post_id) {
            // TODO:we should record that this happened.
          }
        }
      );
    }
  },

  _toggleComment : function(e){
    // if the click was on an anchor within the frame comment just let the normal
    // link handling occur without showing/hiding the rest of the comment
    if (!$(e.target).is('a')) {
      $(e.currentTarget).toggleClass('line-clamp--open');
    }
  },

  _toggleShareMenu : function(){
    var $this = this.$('.js-share-menu'),
        block = $this.siblings('.js-share-menu-block'),
        blockHasClass = block.hasClass('hidden');

    // if we're opening the menu and we don't have the shortlink
    // yet, we need to get it now
    if (blockHasClass && !this._currentFrameShortlink) {
      this._getFrameShortlink();
    }

    //  toggle the "button pressed" state
    $this.toggleClass('button_default',!blockHasClass)
         .toggleClass('button_gray-light',blockHasClass);

    //  show/hide the panel
    block.toggleClass('hidden',!blockHasClass);

    // if we open the menu and we already have the shortlink,
    // highlight it
    if (blockHasClass && this._currentFrameShortlink) {
      this.$('.js-frame-shortlink').select();
    }

  },

  _getFrameShortlink : function() {
    var self = this;
    var $shortlinkTextInput = this.$('.js-frame-shortlink');
    // fetch the short link
    $.ajax({
      url: 'http://api.shelby.tv/v1/frame/'+this._currentFrame.id+'/short_link',
      dataType: 'jsonp',
      success: function(r){
        $shortlinkTextInput.val(r.result.short_link).select();
        // save the link for future reference in case we are going to
        // re-render without changing frames
        self._currentFrameShortlink = r.result.short_link;
      },
      error: function(){
        $shortlinkTextInput.val("Link Unavailable").select();
      }
    });
  },

  _selectShortLinkText : function(){
    this.$('.js-frame-shortlink').select();
  }


});
