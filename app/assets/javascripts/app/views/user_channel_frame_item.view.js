libs.shelbyGT.UserChannelFrameItemView = libs.shelbyGT.ActiveHighlightListItemView.extend({

  _frame : null,

  options : _.extend({}, libs.shelbyGT.ActiveHighlightListItemView.prototype.options, {
      activationStateProperty : 'activeFrameModel',
      className : 'user-channel__item js-user-channel-item',
      guideOverlayModel : null,
      // playlistXxx options MUST be supplied by the parent list view
      playlistFrameGroupCollection : null, // the playlist collection that this view's frame model belongs to
      playlistManagerModel : null, // the app-wide model used to interact with the PlaylistManager
      playlistType : null // the type of playlist that this view's frame model is on: dashboard, roll, etc
  }),

  events : {
    'click .js-play-explore-frame'            : '_displayVideo',
    'click .js-queue-command:not(.js-queued)' : '_queueVideo',
    'click .js-roll-command'                  : '_displayRollVideo'
  },

  initialize : function() {
    this._frame = this.model.getFirstFrame();
    shelby.models.queuedVideos.bind('add:queued_videos', this._onQueuedVideosAdd, this);
    shelby.models.queuedVideos.bind('remove:queued_videos', this._onQueuedVideosRemove, this);
    return libs.shelbyGT.ActiveHighlightListItemView.prototype.initialize.call(this);
  },

  _cleanup : function() {
    shelby.models.queuedVideos.unbind('add:queued_videos', this._onQueuedVideosAdd, this);
    shelby.models.queuedVideos.unbind('remove:queued_videos', this._onQueuedVideosRemove, this);
    return libs.shelbyGT.ActiveHighlightListItemView.prototype._cleanup.call(this);
  },

  template : function(obj){
    return SHELBYJST['explore-frame-item'](obj);
  },

  render : function(){
    this.$el.html(this.template({
      frame : this._frame,
      showFrameLikes : true
    }));

    if (shelby.models.queuedVideos.videoIsInQueue(this._frame.get('video'))) {
      this._updateQueueButton(true);
    }

    this.renderChild(new libs.shelbyGT.FrameLikesView({
      el : this.$('.js-frame-likes'),
      model : this.model,
      numAvatarsDisplayed : 7,
      selfBindAndUpdate : true
    }));

    return this;
  },

  _displayVideo : function(e) {
    // dismiss the dot tv welcome banner if its still there
    shelby.models.dotTvWelcome.trigger('dismiss');
    // activate the current frame
    shelby.models.guide.set('activeFrameModel', this._frame);
    // if the video player has been obscured at all,
    // scroll to the top so you can see the new video that's been selected
    var videoPlayerTop = $('.js-videoplayer').offset().top;
    if ($('body').scrollTop() > videoPlayerTop || $('html').scrollTop() > videoPlayerTop) {
      $('html, body').scrollTo(0, 500);
    }
    // register the playlist this frame is on as the current playlist with the playlist manager
    this.options.playlistManagerModel.set({
      playlistFrameGroupCollection : this.options.playlistFrameGroupCollection,
      playlistType : this.options.playlistType,
      playlistRollId : this.options.playlistType == libs.shelbyGT.PlaylistType.roll ? this._frame.get('roll').id : null
    });

    shelby.trackEx({
      gaCategory : '.TV',
      gaAction : 'Click on frame',
      gaLabel : shelby.models.user.get('nickname'),
      gaValue : this.parent.parent.parent.$('.js-user_roll__item').index(this.parent.parent.el)
    });
  },

  _queueVideo : function() {
    if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.QUEUE) ){
      this._frame.like();
      this._updateQueueButton(true);
    }
  },

  _displayRollVideo : function() {
    if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.ROLL) ){
      shelby.models.guideOverlay.switchOrHideOverlay(libs.shelbyGT.GuideOverlayType.rolling, this._frame);
    }
  },

  _onQueuedVideosAdd : function(video) {
    this._onAddRemoveQueuedVideo(video);
  },

  _onQueuedVideosRemove : function(video) {
    this._onAddRemoveQueuedVideo(video, true);
  },

  _onAddRemoveQueuedVideo : function(video, removeVideo) {
    if (this._frame.get('video').id == video.id){
      this._updateQueueButton(!removeVideo);
    }
  },

  _updateQueueButton : function(itemQueued) {
    var buttonText = itemQueued ? 'Liked' : 'Like';
    var $button = this.$('.js-queue-command');
    $button.toggleClass('queued js-queued', itemQueued).find('.label').text(buttonText);
    $button.find('.js-command-icon').toggleClass('icon-heart--red', itemQueued);
  },

  // override ActiveHighlightListItemView abstract method
  doActivateThisItem : function(guideModel){
    var activeFrameModel = guideModel.get('activeFrameModel');
    return activeFrameModel && this._frame.id == activeFrameModel.id;
  }

});