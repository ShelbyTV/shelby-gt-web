/*
 *
 * Display information about the current video and the next video across the bottom of the video player area.
 *
 */
libs.shelbyGT.PersistentVideoInfoView = Support.CompositeView.extend({

  _currentFrameShortlink : null,
  _liked : false,

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
    "click .js-next-video"                                                        : "_skipToNextVideo",
    "click .js-goto-user-page"                                                    : "_goToUserPage",
    "change .js-like-dislike-form"                                                : "_onChangeForm"

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
      this._frameGroup = playlistFrameGroupCollection.getFrameGroupByFrameId(this._currentFrame.id);
    }

    if(this._currentFrame && this._nextFrame && this._frameGroup){

      var emailBody;
      var tweetIntentParams = {};
      if (shelby.models.user.isAnonymous()) {
        var permalink;
        if (this._frameGroup) {
          permalink = libs.shelbyGT.viewHelpers.frameGroup.contextAppropriatePermalink(this._frameGroup);
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
      var primaryDashboardEntry = this._frameGroup.get('primaryDashboardEntry');
      var isRecommendation = primaryDashboardEntry && primaryDashboardEntry.isRecommendationEntry();
      var isChannelRecommendation = primaryDashboardEntry && (primaryDashboardEntry.get('action') == libs.shelbyGT.DashboardEntryModel.ENTRY_TYPES.channelRecommendation);

      console.log('liked', this._liked);

      this.$el.html(this.template({
        anonUserShareEmailBody  : emailBody,
        currentFrame            : this._currentFrame,
        currentFrameOriginator  : currentFrameOriginator,
        currentFrameShortlink   : this._currentFrameShortlink,
        eventTrackingCategory   : this.options.eventTrackingCategory,
        frameGroup              : this._frameGroup,
        isChannelRecommendation : isChannelRecommendation,
        isRecommendation        : isRecommendation,
        liked                   : this._liked,
        nextFrame               : this._nextFrame,
        queuedVideosModel       : this.options.queuedVideos,
        showNextFrame           : this.options.showNextFrame,
        tweetIntentQueryString  : $.param(tweetIntentParams),
        user                    : shelby.models.user
      }));

      if (isChannelRecommendation) {
        var color = shelby.config.recommendations.displaySettings[libs.shelbyGT.DashboardEntryModel.ENTRY_TYPES.channelRecommendation].color;
        this.$('.js-xuser-data').addClass("xuser-data--" + color).addClass("xuser-data--recommendation");
      }

      if (isRecommendation && !isChannelRecommendation) {
        this.renderChild(new libs.shelbyGT.FrameRecommendationView({
          el : this.$('.js-frame-recommendation'),
          isPvi : true,
          model : primaryDashboardEntry
        }));
      }
    }

    // toggle the video_controls position based on displayState, only if onboarding is incomplete
    var displayState = shelby.models.guide.get('displayState'),
        isOnboarding = displayState == libs.shelbyGT.DisplayState.onboarding;

    $('.js-video-controls-wrapper').toggleClass('video_controls__wrapper--preload', isOnboarding);
  },

  _onActiveFrameModelChange : function(guideModel, activeFrameModel){
    this._currentFrame = activeFrameModel;
    // current frame changed, so we don't have the right shortlink anymore
    this._currentFrameShortlink = null;
    this.render();
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
      if (frameVideo.isSameVideo(video)) {
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
    this._doLike();

    var $target = $(el.currentTarget);
    $target.toggleClass('queued js-queued').find('.label').text('Liked');
    $target.find('.icon').addClass('icon-like--red');
  },

  _skipToNextVideo : function(){
    this.options.userDesires.set('changeVideo', 1);
    this.options.userDesires.unset('changeVideo');
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
  },

  _goToUserPage : function(e){
    shelby.router.navigate($(e.currentTarget).data('user_nickname'), {trigger:true});
  },

  _doLike : function(e) {
    if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.QUEUE) ){
      this._currentFrame.like({likeOrigin: this.options.eventTrackingCategory});
    }
  },

  _onChangeForm : function(e) {
    if(e.target.id.split('-')[0] == 'like' && !this._liked) {
      this._doLike();
      this._liked = true;
    }
    else if(shelby.models.guide.get('displayState') == libs.shelbyGT.DisplayState.watchLaterRoll) {
      this._removeFrame();
      this._liked = false;
    }
  }

});
