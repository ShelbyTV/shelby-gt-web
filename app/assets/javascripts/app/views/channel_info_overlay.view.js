libs.shelbyGT.ChannelInfoOverlayView = Support.CompositeView.extend({

  events: {
    "click .js-channel" : "_onClickChannel"
  },

  template : function(obj){
      return SHELBYJST['video/channel-info-overlay'](obj);
  },

  initialize : function(){
    this.model.bind('change', this._onGuideModelChanged, this);
    this.options.playlistManagerModel.bind('change', this._onPlaylistChanged, this);
  },

  _cleanup : function(){
    this.model.unbind('change', this._onGuideModelChanged, this);
    this.options.playlistManagerModel.unbind('change', this._onPlaylistChanged, this);
  },

  render : function(){
    this.$el.html(this.template({
      channels : shelby.config.channels
    }));
    this.$('.channel-info-section').show();
    this._findHighlightActiveChannel();
  },

  _onClickChannel : function(e) {
    shelby.router.navigate(
      "explore/" + $(e.currentTarget).data('channel'),
      {trigger:true}
    );
  },

  _onGuideModelChanged : function(guideModel) {
    var _changedAttrs = _(guideModel.changedAttributes());
    if (!_changedAttrs.has('displayState') &&
        !_changedAttrs.has('currentChannelId')) {
      return;
    }
    this._onCurrentChannelChanged();
  },

  _onPlaylistChanged : function(playlistManagerModel) {
    var _changedAttrs = _(playlistManagerModel.changedAttributes());
    if (!_changedAttrs.has('playingState') &&
        !_changedAttrs.has('playingChannelId')) {
      return;
    }
    this._onCurrentChannelChanged();
  },

  _onCurrentChannelChanged : function(){
    // remove the active channel highlight
    this.$('.channel-info-section-channel').removeClass('channel-info-section-channel--active');
    // set the highlight on the new active channel
    this._findHighlightActiveChannel();
  },

  _findHighlightActiveChannel : function(){
    // highlight the active channel if there is one
    var activeChannel = libs.utils.channels.getCurrentChannel();
    this.$('.channel-info-section-channel[data-channel=' + activeChannel + ']')
      .addClass('channel-info-section-channel--active').find('.title').text('#'+activeChannel);
  }

});
