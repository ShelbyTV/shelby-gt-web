libs.shelbyGT.PlaybackEventController = Backbone.View.extend({

  _recurringEventIntervals : {},

  options: {
    guideModel: null,
    playbackState : null
  },

  initialize: function(){
    this.options.playbackState.bind('change:activePlayerState', this._onNewPlayerState, this);
    if( this.options.playbackState.get('activePlayerState') !== null ) {
      this._onNewPlayerState(this.options.playbackState, this.options.playbackState.get('activePlayerState'));
    }
    this.options.guideModel.bind('change:activeFrameModel', this._onActiveFrameModelChange, this);
  },

  _cleanup: function() {
    this.options.playbackState.unbind('change:activePlayerState', this._onNewPlayerState, this);
    if( this.options.playbackState.get('activePlayerState') !== null ) {
      this._onNewPlayerState(this.options.playbackState.get('activePlayerState'), null);
    }
    this.options.guideModel.unbind('change:activeFrameModel', this._onActiveFrameModelChange, this);
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

  _onActiveFrameModelChange: function(guideModel, activeFrameModel) {
    // since we're changing to a new frame, all entered events on the old frame should be exited
    // as well as recurring events, in case they need to change back to some default state
    var self = this;
    var lastFrame = guideModel.previous('activeFrameModel');
    if (lastFrame) {
      var eventsToExit = lastFrame.get('events').filter(function(event){
        return event.get('entered') || event.get('recurring');
      });
      _(eventsToExit).each(function(event){
        event.set('entered', false);
        self.model.trigger('exit:' + event.get('event_type'), event);
        //clear the interval for any recurring events
        if (event.get('recurring')) {
          clearInterval(self._recurringEventIntervals[event.cid]);
        }
      });
    }

    // handling for recurring events on the new frame
    activeFrameModel.get('events').chain().filter(function(event){
      return event.get('recurring');
    }).each(function(event){
      //send a one time event for any setup needed by subsequent recurrences of recurring event
      self.model.trigger('enter:recurring:' + event.get('event_type'), event);
      // setup intervals for triggering any recurring events on the new frame
      self._recurringEventIntervals[event.cid] = setInterval(function(){
        self.model.trigger('enter:' + event.get('event_type'), event);
      }, event.get('recur_interval'));
    });
  },

  _onCurrentTimeChange: function(attr, curTime){
    var self = this;

    var frame = this.options.guideModel.get('activeFrameModel');
    if (frame) {
      var eventsToEnter = frame.get('events').filter(function(event){
        return event.get('start_time') <= curTime && event.get('end_time') > curTime && !event.get('entered') && !event.get('recurring');
      });
      _(eventsToEnter).each(function(event){
        event.set('entered', true);
        self.model.trigger('enter:' + event.get('event_type'), event);
      });
      var eventsToExit = frame.get('events').filter(function(event){
        return (event.get('end_time') <= curTime || event.get('start_time') > curTime) && event.get('entered') && !event.get('recurring');
      });
      _(eventsToExit).each(function(event){
        event.set('entered', false);
        self.model.trigger('exit:' + event.get('event_type'), event);
      });
    }
  }

});
