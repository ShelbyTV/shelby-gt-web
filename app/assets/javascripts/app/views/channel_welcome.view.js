libs.shelbyGT.channelWelcome = Support.CompositeView.extend({

  events : {
      "click .js-start-playing" : "_startPlaying"
  },

  template : function(obj){
    return SHELBYJST['channels/channel-welcome'](obj);
  },

  initialize : function(){
    this.options.channelWelcomeModel.bind('dismiss', this._startPlaying, this);
    this.render();
  },

  cleanup : function(){
    this.options.channelWelcomeModel.unbind('dismiss', this._startPlaying, this);
  },

  render : function(){
    this.$el.html(this.template());
    $('#js-welcome, .js-channels-welcome').toggleClass('hidden', true);

    shelby.trackEx({
        providers : ['ga', 'kmq'],
        gaCategory : "Channel Welcome",
        gaAction : 'Loaded',
        gaLabel : shelby.models.user.get('nickname'),
        kmqName : "Channel welcome banner loaded"
      });
  },

  _startPlaying : function(){
    $('#js-welcome, .js-channels-welcome').toggleClass('hidden', true);
    // now play the video and reset autoplay to true.
    shelby.models.userDesires.triggerTransientChange('playbackStatus', libs.shelbyGT.PlaybackStatus.playing);
    shelby.models.playbackState.set('autoplayOnVideoDisplay', true);
    // already dismissed so don't want to respond to events on the model anymore
    this.options.channelWelcomeModel.unbind('dismiss', this._startPlaying, this);
    shelby.userInactivity.enableUserActivityDetection();
   cookies.set('channel-welcome', 1, 1000);
  }
});
