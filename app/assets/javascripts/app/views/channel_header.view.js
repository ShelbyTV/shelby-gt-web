libs.shelbyGT.ChannelHeaderView = Support.CompositeView.extend({

  className : 'channel-header clearfix',

  template : function(obj){
    return SHELBYJST['channel-header'](obj);
  },

  initialize : function(){
    this.model.bind('change', this._onChannelChange, this);
    console.log('temp: ', this.model);
  },

  _cleanup : function(){
    this.channel.unbind('change', this._onChannelChange, this);
  },

  render : function(){
    chId = libs.utils.channels.getCurrentChannel();
    chName = libs.utils.channels.getChannelName(chId);
    this.$el.html(this.template({channelName: chName}));
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
