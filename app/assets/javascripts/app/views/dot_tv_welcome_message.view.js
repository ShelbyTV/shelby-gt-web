libs.shelbyGT.dotTVWelcome = Support.CompositeView.extend({

  events : {
    "click .js-start-playing" : "_startPlaying"
  },

  el : '.js-isolated-roll-welcome',

  template : function(obj){
    return SHELBYJST['dot-tv-welcome-message'](obj);
  },

  initialize : function(){
    this.model.bind('change', this.render, this);
  },

  cleanup : function(){
    this.model.unbind('change', this.render, this);
  },

  render : function(){
    this.$el.html(this.template({roll:this.model}));
    // if we dont want the video to auto play...
    shelby.models.playbackState.set('autoplayOnVideoDisplay', false);
  },

  _startPlaying : function(){
    $('#dot-tv-welcome-message').addClass('hidden');
    // now play the video and reset autoplay to true.
    shelby.models.userDesires.triggerTransientChange('playbackStatus', libs.shelbyGT.PlaybackStatus.playing);
    shelby.models.playbackState.set('autoplayOnVideoDisplay', true);
  }
});