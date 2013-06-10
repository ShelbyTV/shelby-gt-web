libs.shelbyGT.welcomeMessages = Support.CompositeView.extend({

  events : {
    "click .js-play"        :       "_onClickPlay"
  },

  template : function(obj){
    return SHELBYJST['app-welcome'](obj);
  },

  initialize : function(){
    shelby.models.guide.bind('change:displayState', this._changeDisplay, this);
  },

  cleanup : function(){
    shelby.models.guide.unbind('change:displayState', this._changeDisplay, this);
  },

  render : function(){
    this.$el.html(this.template({
      header: "Welcome to Shelby.tv",
      message: "This stream of video was made just for you. The more you watch, like and share the better it will get!",
      button: "Play Your Stream"
    }));

    $('#js-welcome, .js-app-welcome').removeClass('hidden');
  },

  _changeDisplay : function() {
    // show welcome to stream message
    if ((shelby.models.guide.get('displayState') == "dashboard") && !shelby.models.user.get('app_progress').hasBeenWelcomed()){
      shelby.models.userDesires.set('playbackStatus',libs.shelbyGT.PlaybackStatus.paused);
      shelby.models.playbackState.set('autoplayOnVideoDisplay', false);
      shelby.userInactivity.disableUserActivityDetection();
      this.render();
    }
    // in the future show welome to community channel or me
    else {
      this._resetVideoPlayerOperation();
    }
  },

  _onClickPlay : function() {
      this._resetVideoPlayerOperation();
      $('#js-welcome, .js-app-welcome').addClass('hidden');
  },

  _resetVideoPlayerOperation : function(){
      $('#js-welcome, .js-app-welcome').addClass('hidden');
      shelby.models.playbackState.set('autoplayOnVideoDisplay', true);
      shelby.userInactivity.enableUserActivityDetection();
      //shelby.models.userDesires.set('playbackStatus',libs.shelbyGT.PlaybackStatus.playing);
  }

});
