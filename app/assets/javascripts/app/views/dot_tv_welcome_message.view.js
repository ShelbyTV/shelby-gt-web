libs.shelbyGT.dotTVWelcome = Support.CompositeView.extend({

  events : function() {
    if (this.$el.hasClass('js-isolated-roll-welcome--dot-tv')) {
      return {
        "click" : "_startPlaying"
      };
    } else {
      return {
        "click .js-start-playing" : "_startPlaying"
      };
    }
  },

  template : function(obj){
    return SHELBYJST['dot-tv-welcome-message'](obj);
  },

  initialize : function(){
    this.model.bind('change', this.render, this);
    this.options.dotTvWelcomeModel.bind('dismiss', this._startPlaying, this);
  },

  cleanup : function(){
    this.model.unbind('change', this.render, this);
    this.options.dotTvWelcomeModel.unbind('dismiss', this._startPlaying, this);
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
    // already dismissed so don't want to respond to events on the model anymore
    this.options.dotTvWelcomeModel.unbind('dismiss', this._startPlaying, this);
  }
});
