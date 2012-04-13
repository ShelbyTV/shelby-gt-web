// This is the high-level playback state
// Each player has it's own PlayerState that it keeps up to date.
// When we change players, PlaybackState.activePlayerState changes to reference the correct player's PlayerState

libs.shelbyGT.PlaybackStateModel = Backbone.Model.extend({

	defaults: {
		//the state of the player that is currently active.  bind to change:activePlayerState to know when player changes
		activePlayerState: null,
		
		//should we auto-play when a new video is displayed?
		autoplayOnVideoDisplay: true
	},
	
	initialize: function(){
  }

});
