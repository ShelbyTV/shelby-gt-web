libs.shelbyGT.welcomeMessages = Support.CompositeView.extend({

  _appProgressKey : null,

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

  render : function(currentDisplayState){
    this._appProgressKey = currentDisplayState || shelby.models.guide.get('displayState');

    this._prepareForModal();
    this.$el.html(this.template({
      currentDisplayState: this._appProgressKey
    }));

    $('#js-welcome, .js-app-welcome').removeClass('hidden');
  },

  _changeDisplay : function() {
    // show welcome to stream, community, shares message
    var displayState = shelby.models.guide.get('displayState');

    if(displayState == libs.shelbyGT.DisplayState.userPreferences) {
      $('#js-welcome, .js-app-welcome').addClass('hidden');
      return;
    }

    switch  (displayState) {
      case libs.shelbyGT.DisplayState.dashboard:
        if (!shelby.models.user.get('app_progress').hasBeenWelcomed('dashboard')){
          return this.render('dashboard');
        }
        break;
      case libs.shelbyGT.DisplayState.channel:
        if (!this._hasBeenWelcomedLoggedOut() && shelby.models.user.isAnonymous()){
          return this.render('channel');
        }
        else if (!shelby.models.user.get('app_progress').hasBeenWelcomed('channel') && !shelby.models.user.isAnonymous()){
          return this.render('channel');
        }
        break;
      case libs.shelbyGT.DisplayState.standardRoll:
        if (shelby.models.guide.get('currentRollModel').get('creator_id') == shelby.models.user.id && !shelby.models.user.get('app_progress').hasBeenWelcomed('ownShares')) {
          return this.render('ownShares');
        }
        else if (!this._hasBeenWelcomedLoggedOut() && shelby.models.user.isAnonymous()){
          return this.render('loggetOutShares');
        }
        else { this._resetVideoPlayerOperation(); }
        break;
    }
    this._resetVideoPlayerOperation();
  },

  _onClickPlay : function() {
      var _progress = this._appProgressKey+'Welcomed';
      this._updateAppProgress(_progress, true);
      this._resetVideoPlayerOperation();
      shelby.models.userDesires.set('playbackStatus',libs.shelbyGT.PlaybackStatus.playing);
      $('#js-welcome, .js-app-welcome').addClass('hidden');
      if (shelby.models.user.isAnonymous()) {
        this._markViewerWelcomedLoggedOut();
      }
  },

  _updateAppProgress : function(property, val){
    shelby.models.user.get('app_progress').set(property, val);
    shelby.models.user.get('app_progress').saveMe();
  },

  _prepareForModal : function(){
      shelby.models.userDesires.set('playbackStatus',libs.shelbyGT.PlaybackStatus.paused);
      shelby.models.playbackState.set('autoplayOnVideoDisplay', false);
      shelby.userInactivity.disableUserActivityDetection();
  },

  _resetVideoPlayerOperation : function(){
      $('#js-welcome, .js-app-welcome').addClass('hidden');
      shelby.models.playbackState.set('autoplayOnVideoDisplay', true);
      shelby.userInactivity.enableUserActivityDetection();
  },

  _markViewerWelcomedLoggedOut : function(){
    cookies.set('welcomedToShelby', true);
  },

  _hasBeenWelcomedLoggedOut : function(){
    return cookies.get('welcomedToShelby') !== "" ? true : false;
  }

});
