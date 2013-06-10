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

  render : function(currentDisplayState){
    this.$el.html(this.template({
      currentDisplayState: currentDisplayState || shelby.models.guide.get('displayState')
    }));

    $('#js-welcome, .js-app-welcome').removeClass('hidden');
  },

  _changeDisplay : function() {
    // show welcome to stream message
    if ((shelby.models.guide.get('displayState') == "dashboard") && !shelby.models.user.get('app_progress').hasBeenWelcomed('stream')){
      this._prepareVideoPlayerForModal();
      this.render();
    }
    else if ((shelby.models.guide.get('displayState') == "channel") && !shelby.models.user.get('app_progress').hasBeenWelcomed('community')){
      this._prepareVideoPlayerForModal();
      this.render();
    }
    else if ((shelby.models.guide.get('displayState') == "standardRoll")){
      if ((shelby.models.guide.get('currentRollModel').get('creator_id') == shelby.models.user.id) && !shelby.models.user.get('app_progress').hasBeenWelcomed('ownShares')) {
        this._prepareVideoPlayerForModal();
        this.render('ownShares');
      }
      else if (!shelby.models.user.get('app_progress').hasBeenWelcomed('othersShares')) {
        this._prepareVideoPlayerForModal();
        this.render('othersShares');
      }
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

  _prepareVideoPlayerForModal : function(){
      shelby.models.userDesires.set('playbackStatus',libs.shelbyGT.PlaybackStatus.paused);
      shelby.models.playbackState.set('autoplayOnVideoDisplay', false);
      shelby.userInactivity.disableUserActivityDetection();
  },

  _resetVideoPlayerOperation : function(){
      $('#js-welcome, .js-app-welcome').addClass('hidden');
      shelby.models.playbackState.set('autoplayOnVideoDisplay', true);
      shelby.userInactivity.enableUserActivityDetection();
      shelby.models.userDesires.set('playbackStatus',libs.shelbyGT.PlaybackStatus.playing);
  }

});
