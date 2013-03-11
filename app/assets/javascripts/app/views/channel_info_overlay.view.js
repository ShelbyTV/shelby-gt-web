libs.shelbyGT.ChannelInfoOverlayView = Support.CompositeView.extend({

  events: {
    "click .js-channel" : "_onClickChannel"
  },

  template : function(obj){
      return SHELBYJST['channels/channel-info-overlay'](obj);
  },

  initialize : function(){
    this.options.playlistManagerModel.bind('change', this._onPlaylistChanged, this);
  },

  _cleanup : function(){
    this.options.playlistManagerModel.unbind('change', this._onPlaylistChanged, this);
  },

  render : function(){
    this.$el.append(this.template({
      channels : shelby.config.channels
    }));
    this._findHighlightActiveChannel();
    if (this.options.playlistManagerModel.get('playlistType') == "channel"){
        this.$('.js-channel-block').show();
      }
  },

  _onClickChannel : function(e) {
    shelby.models.userDesires.set({guideShown: true});

    shelby.router.navigate(
      "channels/" + $(e.currentTarget).data('channel'),
      {trigger:true}
    );
  },

  _onPlaylistChanged : function(playlistManagerModel) {
    var _changedAttrs = _(playlistManagerModel.changedAttributes());
    if (playlistManagerModel.get('playlistType') !== "channel"){
      this.$('.js-channel-block').hide();
    }
    else {
      this.$('.js-channel-block').show();
    }
    if (!_changedAttrs.has('playlistType') &&
        !_changedAttrs.has('playlistRollId')) {
      return;
    }

    this._onCurrentChannelChanged();
  },

  _onCurrentChannelChanged : function(){
    // remove the active channel highlight
    this.$('.js-channel')
          .children('.channel_menu__button')
            .toggleClass('button_default',true)
            .toggleClass('button_green-soft',false);
    // set the highlight on the new active channel
    this._findHighlightActiveChannel();
  },

  _findHighlightActiveChannel : function(){
    // highlight the active channel if there is one
    var activeChannel = libs.utils.channels.getCurrentChannel();
    this.$('.js-channel[data-channel=' + activeChannel + ']')
          .children('.channel_menu__button')
            .toggleClass('button_default',false)
            .toggleClass('button_green-soft',true);
  }

});
