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
    "click .persistent_video_info__current-frame  .js-queue-frame:not(.queued)"   : "_queueCurrentFrame",
    "click .persistent_video_info__next-frame     .js-queue-frame:not(.queued)"   : "_queueNextFrame",
    "click .persistent_video_info__current-frame  .js-navigate-originator"        : "_gotoOriginator",
    "click .persistent_video_info__current-frame  .js-navigate-creator"           : "_gotoCreator",
    "click .js-toggle-comment"                                                    : "_toggleComment",
    "click .js-next-video"                                                        : "_skipToNextVideo"
  },

  initialize: function(){
    this._currentFrame = this.options.guide.get('activeFrameModel');

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
    var playlistFrameGroupCollection = this.options.playlistManager.get('playlistFrameGroupCollection');
    if(this._currentFrame && playlistFrameGroupCollection){
      this._nextFrame = playlistFrameGroupCollection.getNextPlayableFrame(this._currentFrame, 1, true);
    }

    if(this._currentFrame && this._nextFrame){
      var emailBody;
      var tweetIntentParams = {};
      var _frameGroup = this.options.playlistManager.get('playlistFrameGroupCollection').getFrameGroupByFrameId(this._currentFrame.id);
      if (shelby.models.user.isAnonymous()) {
        var permalink;
        if (_frameGroup) {
          permalink = libs.shelbyGT.viewHelpers.frameGroup.contextAppropriatePermalink(_frameGroup);
        } else {
          permalink = libs.shelbyGT.viewHelpers.frame.permalink(this._currentFrame);
        }
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

      var currentFrameOriginator = (this._currentFrame.has('originator_id')) ? this._currentFrame.get('originator') : null;

      this.$el.html(this.template({
        anonUserShareEmailBody : emailBody,
        currentFrame           : this._currentFrame,
        currentFrameOriginator : currentFrameOriginator,
        currentFrameShortlink  : this._currentFrameShortlink,
        eventTrackingCategory  : this.options.eventTrackingCategory,
        frameGroup             : _frameGroup,
        nextFrame              : this._nextFrame,
        queuedVideosModel      : this.options.queuedVideos,
        showNextFrame          : this.options.showNextFrame,
        tweetIntentQueryString : $.param(tweetIntentParams),
        user                   : shelby.models.user
      }));
    }
  },

  _onActiveFrameModelChange : function(guideModel, activeFrameModel){
    this._currentFrame = activeFrameModel;
    // current frame changed, so we don't have the right shortlink anymore
    this._currentFrameShortlink = null;
    this.render();
    // track an event of how many recommendations we have to show for this video
    if (!activeFrameModel.get('isSearchResultFrame')) {
      shelby.trackEx({
        providers : ['ga'],
        gaCategory : 'Video Recommendations',
        gaAction : 'Could be shown',
        gaLabel : activeFrameModel.get('video').id,
        gaValue : activeFrameModel.get('video').get('recs').length
      });
    }
  },

  _onplaylistFrameGroupCollectionChange : function(playlistManagerModel, playlistFrameGroupCollection){
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
        $button.find('.icon').toggleClass('icon-like--red', !removeVideo);
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
    var frameGroup = this.options.playlistManager.get('playlistFrameGroupCollection').getFrameGroupByFrameId(this._currentFrame.id);
    var dbEntry = frameGroup.get('primaryDashboardEntry');
    this.options.guideOverlayModel.switchOrHideOverlay(libs.shelbyGT.GuideOverlayType.rolling, frame, dbEntry);
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
      var frameGroup = this.options.playlistManager.get('playlistFrameGroupCollection').getFrameGroupByFrameId(this._currentFrame.id);
      var dbEntry = frameGroup.get('primaryDashboardEntry');
      this.options.guideOverlayModel.switchOrHideOverlay(libs.shelbyGT.GuideOverlayType.share, frame, dbEntry);
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
      $target.find('.icon').addClass('icon-like--red');
    }
  },

  _skipToNextVideo : function(){
    this.options.userDesires.set('changeVideo', 1);
    this.options.userDesires.unset('changeVideo');
  },

  _getFrameShortlink : function() {
    if (!this._currentFrame.get('isSearchResultFrame')) {
      var self = this;
      var $shortlinkTextInput = this.$('.js-frame-shortlink');
      var fetchShortlinkUrl;
      var frameGroup = this.options.playlistManager.get('playlistFrameGroupCollection').getFrameGroupByFrameId(this._currentFrame.id);
      var dbEntry = frameGroup.get('primaryDashboardEntry');
      if (dbEntry) {
        fetchShortlinkUrl = shelby.config.apiRoot + '/dashboard/' + dbEntry.id + '/short_link';
      } else {
        fetchShortlinkUrl = shelby.config.apiRoot + '/frame/' + this._currentFrame.id + '/short_link';
      }
      // fetch the short link
      $.ajax({
        url: fetchShortlinkUrl,
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
    }
  },

  _toggleComment : function(e){
    // if the click was on an anchor within the frame comment just let the normal
    // link handling occur without showing/hiding the rest of the comment
    if (!$(e.target).is('a')) {
      $(e.currentTarget).toggleClass('line-clamp--open');
    }
  },

  _gotoOriginator : function(e) {
    e.preventDefault();

    shelby.router.navigate(this._currentFrame.get('originator').get('nickname'),{trigger:true});
  },

  _gotoCreator : function(e){
    e.preventDefault();

    var currentFrame = this._currentFrame.get('roll'),
        currentFrameId = currentFrame.get('id'),
        currentFrameNickname = currentFrame.get('creator_nickname');

    shelby.router.navigate((currentFrameNickname) ? currentFrameNickname : '/roll/' + currentFrameId,{trigger:true});
  }

});
