libs.shelbyGT.appWelcome = Support.CompositeView.extend({

  events : {
    "click .js-play"        :       "_onClickPlay"
  },

  template : function(obj){
    return SHELBYJST['app-welcome'](obj);
  },

  initialize : function(){
    if (false && !shelby.models.user.get('app_progress').hasBeenWelcomed()){
      shelby.models.playbackState.set('autoplayOnVideoDisplay', false);
      shelby.userInactivity.disableUserActivityDetection();
      this.render();
    }
  },

  cleanup : function(){
  },

  render : function(){
    this.$el.html(this.template());
    $('#js-welcome, .js-app-welcome').removeClass('hidden');
  },

  _onClickPlay : function() {
      shelby.models.playbackState.set('autoplayOnVideoDisplay', true);
      shelby.userInactivity.enableUserActivityDetection();
      $('#js-welcome, .js-app-welcome').addClass('hidden');
      shelby.models.userDesires.set('playbackStatus',libs.shelbyGT.PlaybackStatus.playing);
  }

});
