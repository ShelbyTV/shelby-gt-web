libs.shelbyGT.ExploreFrameItemView = libs.shelbyGT.ListItemView.extend({

  events : {
    'click .js-play-explore-frame'            : '_displayVideo',
    'click .js-queue-command:not(.js-queued)' : '_queueVideo',
    'click .js-roll-command'                  : '_displayRollVideo'
  },

  className : 'explore-roll-item',

  initialize : function() {
    shelby.models.queuedVideos.bind('add:queued_videos', this._onQueuedVideosAdd, this);
    shelby.models.queuedVideos.bind('remove:queued_videos', this._onQueuedVideosRemove, this);
  },

  _cleanup : function() {
    shelby.models.queuedVideos.unbind('add:queued_videos', this._onQueuedVideosAdd, this);
    shelby.models.queuedVideos.unbind('remove:queued_videos', this._onQueuedVideosRemove, this);
  },

  template : function(obj){
    return SHELBYJST['explore-frame-item'](obj);
  },

  render : function(){
    this.$el.html(this.template({frame : this.model}));
    if (shelby.models.queuedVideos.videoIsInQueue(this.model.get('video'))) {
      this._updateQueueButton(true);
    }
    return this;
  },

  _displayVideo : function() {
    shelby.models.routingState.set('forceFramePlay', true);
    shelby.router.navigate('roll/' + this.options.roll.id + '/frame/' + this.model.id, {trigger:true});
  },

  _queueVideo : function() {
    if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.QUEUE) ){
      this.model.saveToWatchLater();
      this._updateQueueButton(true);
    }
  },

  _displayRollVideo : function() {
    if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.ROLL) ){
      shelby.models.guideOverlay.switchOrHideOverlay(libs.shelbyGT.GuideOverlayType.rolling, this.model);
    }
  },

  _onQueuedVideosAdd : function(video) {
    this._onAddRemoveQueuedVideo(video);
  },

  _onQueuedVideosRemove : function(video) {
    this._onAddRemoveQueuedVideo(video, true);
  },

  _onAddRemoveQueuedVideo : function(video, removeVideo) {
    if (this.model.get('video').id == video.id){
      this._updateQueueButton(!removeVideo);
    }
  },

  _updateQueueButton : function(itemQueued) {
    var buttonText = itemQueued ? 'Queued' : 'Queue';
    this.$('.js-queue-command').toggleClass('queued js-queued', itemQueued).find('.js-command-icon').text(buttonText);
  }

});