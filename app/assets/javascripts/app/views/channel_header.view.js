libs.shelbyGT.ChannelHeaderView = Support.CompositeView.extend({

  className : 'channel-header clearfix',

  template : function(obj){
    return SHELBYJST['channels/channel-header'](obj);
  },

  initialize : function(){
    this.model.bind('change', this._onChannelChange, this);
  },

  _cleanup : function(){
    this.model.unbind('change', this._onChannelChange, this);
  },

  render : function(){
    if (chId = this.model.get('currentChannelId')){
      chName = libs.utils.channels.getChannelName(chId);
      this.$el.html(this.template({channelName: chName}));
    }
  },

  _onChannelChange : function(chModel){
    var _changedAttrs = _(chModel.changedAttributes());
    if (!_changedAttrs.has('displayState') &&
        !_changedAttrs.has('currentChannelId')) {
      return;
    }
    this.render();
  }

});
