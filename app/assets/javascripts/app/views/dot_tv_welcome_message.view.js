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
    this.$el.show();
  },

  _startPlaying : function(){
    this.$el.hide();
    // now play the video and reset autoplay to true.
    shelby.models.userDesires.triggerTransientChange('playbackStatus', libs.shelbyGT.PlaybackStatus.playing);
    shelby.models.playbackState.set('autoplayOnVideoDisplay', true);
  }
});