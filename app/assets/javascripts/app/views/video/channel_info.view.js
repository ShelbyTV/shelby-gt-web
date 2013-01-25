/*
 *
 * Display information about the current video and the next video across the bottom of the video player area.
 *
 */
libs.shelbyGT.ChannelInfoView = Support.CompositeView.extend({

  events : {
    //"click .js-next-channel"      : "_skipToNextChannel",
    //"click .js-prev-channel"      : "_skipToPreviousChannel"
  },

  initialize: function(opts){
    this.options.guide.bind('change:displayState', this._onDisplayStateChange, this);
    this.options.channel.bind('change:channel', this._onChannelChange, this);
    this._currentChannel = null;
  },

  _cleanup : function() {

  },

  template : function(obj) {
    try {
      return SHELBYJST['video/channel-info'](obj);
    } catch(e){
      console.log(e.message, e.stack, obj);
    }
  },

  render : function() {
    this.$el.html(this.template({
      currentChannel: this._currentChannel,
      nextChannel: this._nextChannel,
      prevChannel: this._prevChannel
    }));
  },

  _onDisplayStateChange : function(model, state){
    if (state == "channel"){
      this.render();
    }
  },

  _onChannelChange : function(model, state){
    this._currentChannel = state;
  },

  _skipToNextChannel : function(){
    console.log("NEXT CHANNEL");
  },

  _skipToPreviousChannel : function(){
    console.log("PREV CHANNEL");
  }

});