libs.shelbyGT.ExploreFrameItemView = libs.shelbyGT.ListItemView.extend({

  events : {
    'click .js-explore-frame-thumbnail'       : '_displayVideo',
    'click .js-queue-command:not(.js-queued)' : '_queueVideo',
    'click .js-roll-command'                  : '_displayRollVideo'
  },

  className : 'explore-roll-item',

  initialize : function() {
    shelby.models.queuedVideos.bind('add:queued_videos', this._onQueuedVideosAdd, this);
  },

  _cleanup : function() {
    shelby.models.queuedVideos.unbind('add:queued_videos', this._onQueuedVideosAdd, this);
  },

  template : function(obj){
    return JST['explore-frame-item'](obj);
  },

  render : function(){
    this.$el.html(this.template({frame : this.model}));
    if (shelby.models.queuedVideos.videoIsInQueue(this.model.get('video'))) {
      this.$('.js-queue-command').text('Queued').addClass('frame-queued js-queued');
    }
    return this;
  },

  _displayVideo : function() {
    shelby.router.navigate('roll/' + this.options.roll.id + '/frame/' + this.model.id, {trigger:true});
  },

  _queueVideo : function() {
    this.model.saveToWatchLater();
    this.$('.js-queue-command').text('Queued').addClass('frame-queued js-queued');
  },

  _displayRollVideo : function() {
    shelby.models.guideOverlay.switchOrHideOverlay(libs.shelbyGT.GuideOverlayType.rolling, this.model);
  },

  _onQueuedVideosAdd : function(video) {
    if (this.model.get('video').id == video.id){
      this.$('.js-queue-command').text('Queued').addClass('frame-queued js-queued');
    }
  }

});