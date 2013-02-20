libs.shelbyGT.UserChannelFrameItemView = libs.shelbyGT.ActiveHighlightListItemView.extend({

  _frame : null,

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
    this.$el.html(this.template({frame : this._frame}));
    if (shelby.models.queuedVideos.videoIsInQueue(this._frame.get('video'))) {
      this._updateQueueButton(true);
    }
    return this;
  },

  _displayVideo : function() {
    shelby.models.guide.set('activeFrameModel', this._frame);
    shelby.models.playlistManager.set({
      playingFrameGroupCollection : this.options.playingRollFrameGroupCollection,
      playingState : libs.shelbyGT.PlayingState.roll,
      playingRollId : this._frame.get('roll').id
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