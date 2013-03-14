libs.shelbyGT.searchWelcome = Support.CompositeView.extend({

  events : {
      "submit #js-video-search-form" : "_onSearchSubmit"
  },

  template : function(obj){
    return SHELBYJST['search-welcome'](obj);
  },

  initialize : function(){
    this.options.searchWelcomeModel.bind('dismiss', this._startPlaying, this);
    this.render();
  },

  cleanup : function(){
    this.options.searchWelcomeModel.unbind('dismiss', this._startPlaying, this);
  },

  render : function(){
    this.$el.html(this.template());
    $('#js-welcome, .js-search-welcome').toggleClass('hidden', true);
  },

  _onSearchSubmit : function() {
    var query = _(this.$('#js-video-search-query-input').val()).clean();
    if (query) {
      shelby.models.videoSearch.set('query', query);
      shelby.models.videoSearch.trigger('search');
      // event tracking
      shelby.trackEx({
        gaCategory : 'search',
        gaAction : query.toLowerCase(),
        gaLabel : shelby.models.user.get('nickname')
      });
    }
    $('#js-welcome, .js-search-welcome').toggleClass('hidden', true);
    shelby.models.userDesires.triggerTransientChange('playbackStatus', libs.shelbyGT.PlaybackStatus.playing);
    shelby.models.playbackState.set('autoplayOnVideoDisplay', true);
    // already dismissed so don't want to respond to events on the model anymore
    this.options.searchWelcomeModel.unbind('dismiss', this._startPlaying, this);
    shelby.userInactivity.enableUserActivityDetection();
    //cookies.set('search-welcome', 1, 1000);
    this.$('#js-video-search-query-input').val('');
    return false;
  }

});
