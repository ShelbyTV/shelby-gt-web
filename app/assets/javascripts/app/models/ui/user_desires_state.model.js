// When the user tries to play/pause video, scrub, etc. we update this UserDesires model
// This keeps their state tracked and allows anyone to respond to it (as opposed to firing off events that you need to listen to)

libs.shelbyGT.UserDesiresStateModel = Backbone.Model.extend({

  defaults: {
    // play/paused based on the constants in libs.shelbyGT.PlaybackStatus
    playbackStatus: null,
    currentTimePct: null,
    mute: false,
    volume: 1.0,
    hdVideo: true,
    guideShown: true
  }

});
