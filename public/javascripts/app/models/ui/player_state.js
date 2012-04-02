//each player maintains its own PlayerState

libs.shelbyGT.PlayerStateModel = Backbone.Model.extend({

	defaults: {
		//is this player currently set to be visible
		"visible": false,
		
		//player's functionality support
		"supportsChromeless": true,
		"supportsMute": true,
		"supportsVolume": false,
		
		//player's state
    "playerLoaded": false,
		"playbackStatus": null,
		"currentTime": 0,
		"bufferTime": 0,
		"duration": 0,
		"muted": false,
		"volume": null
	}
	
});

libs.shelbyGT.PlaybackStatus = {
	playing: 'playing',
	paused: 'paused',
	ended: 'ended',
	buffering: 'buffering',
	cued: 'cued',
	error: {
		generic: 'error:generic',
		videoNotFound: 'error:video_not_found',
		videoNotEmbeddable: 'error:video_not_embeddable'
	}
};