libs.shelbyGT.ChannelInfoOverlayView = Support.CompositeView.extend({

  events: {
    "click .js-channel" : "_onClickChannel"
  },

  template : function(obj){
      return SHELBYJST['video/channel-info-overlay'](obj);
  },

  initialize : function(){
    this.options.playlistManagerModel.bind('change', this._onPlaylistChanged, this);
  },

  _cleanup : function(){
    this.options.playlistManagerModel.unbind('change', this._onPlaylistChanged, this);
  },

  render : function(){
    this.$el.html(this.template({
      channels : shelby.config.channels
    }));
    this._findHighlightActiveChannel();
    if (this.options.playlistManagerModel.get('playlistType') == "channel"){
        this.$('.channel-info-section').show();
      }
  },

  _onClickChannel : function(e) {
    shelby.router.navigate(
      "channels/" + $(e.currentTarget).data('channel'),
      {trigger:true}
    );
  },

  _onPlaylistChanged : function(playlistManagerModel) {
    var _changedAttrs = _(playlistManagerModel.changedAttributes());
    if (playlistManagerModel.get('playlistType') !== "channel"){
      this.$('.channel-info-section').hide();
    }
    else {
      this.$('.channel-info-section').show();
    }
    if (!_changedAttrs.has('playlistType') &&
        !_changedAttrs.has('playlistRollId')) {
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
