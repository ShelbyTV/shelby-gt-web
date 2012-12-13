libs.shelbyGT.PlaybackEventController = Backbone.View.extend({

  options: {
    guideModel: null,
    playbackState : null
  },

  initialize: function(){
    this.options.playbackState.bind('change:activePlayerState', this._onNewPlayerState, this);
    if( this.options.playbackState.get('activePlayerState') !== null ) {
      this._onNewPlayerState(this.options.playbackState, this.options.playbackState.get('activePlayerState'));
    }
  },

  _cleanup: function() {
    this.options.playbackState.unbind('change:activePlayerState', this._onNewPlayerState, this);
    if( this.options.playbackState.get('activePlayerState') !== null ) {
      this._onNewPlayerState(this.options.playbackState.get('activePlayerState'), null);
    }
  },

  //--------------------------------------
  // Handle changes of current playerState
  //--------------------------------------

  _onNewPlayerState: function(playbackState, newPlayerState){
    var prevPlayerState = playbackState.previous('activePlayerState');
    if( prevPlayerState ){
      prevPlayerState.unbind('change:currentTime', this._onCurrentTimeChange, this);
    }

    if (newPlayerState) {
      newPlayerState.bind('change:currentTime', this._onCurrentTimeChange, this);
    }
  },

  _onCurrentTimeChange: function(attr, curTime){
    var self = this;

    var frame = this.options.guideModel.get('activeFrameModel');
    if (frame) {
      var eventsToEnter = frame.get('events').filter(function(event){
        return event.get('startTime') <= curTime && event.get('endTime') > curTime && !event.get('entered');
      });
      _(eventsToEnter).each(function(event){
        event.set('entered', true);
        self.model.trigger('enter', event);
      });
      var eventsToExit = frame.get('events').filter(function(event){
        return event.get('endTime') <= curTime && event.get('entered');
      });
      _(eventsToExit).each(function(event){
        event.set('entered', false);
        self.model.trigger('exit', event);
      });
    }
  }

});
