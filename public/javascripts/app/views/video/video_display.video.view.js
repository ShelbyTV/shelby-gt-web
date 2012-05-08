//
// handle the showing and playback of videos via child views
//

libs.shelbyGT.VideoDisplayView = Support.CompositeView.extend({

  el: '.video-player',

	_curView: null,
	_playbackState: shelby.models.playbackState,

  initialize: function(opts){
		this._playbackState = opts.playbackState;
		this._userDesires = opts.userDesires;

		//we swap between these player views
		this._playerViews = {
			'youtube':        new libs.shelbyGT.YouTubeVideoPlayerView({playbackState:this._playbackState}),
			'vimeo':          new libs.shelbyGT.VimeoVideoPlayerView({playbackState:this._playbackState}),
			'collegehumor':   new libs.shelbyGT.CollegeHumorVideoPlayerView({playbackState:this._playbackState}),
			'dailymotion':    new libs.shelbyGT.DailyMotionVideoPlayerView({playbackState:this._playbackState}),
			'bliptv':         new libs.shelbyGT.BlipTvVideoPlayerView({playbackState:this._playbackState}),
			'ooyala':         new libs.shelbyGT.OoyalaVideoPlayerView({playbackState:this._playbackState}),
			'hulu':           new libs.shelbyGT.HuluVideoPlayerView({playbackState:this._playbackState})
		};

    this.model.bind('change:activeFrameModel', this._displayVideo, this);

    this._userDesires.bind('change:playbackStatus', this._changePlaybackStatus, this);
    this._userDesires.bind('change:currentTimePct', this._seekByPct, this);
    this._userDesires.bind('change:mute', this._changeMute, this);
    this._userDesires.bind('change:volume', this._changeVolume, this);
    this._userDesires.bind('change:guideShown', this._guideVisibilityChange, this);
    
    _.each(this._playerViews, function(playerView){
      playerView.playerState.bind("change:playerLoaded", this._preventPlayerBootstrapGlitch, this);
    }, this);
    
    //playback event tracking
    libs.utils.VideoPlaybackEvents.initialize(this._playbackState, this.model, this._userDesires);
  },

	_cleanup : function() {
    this.model.unbind('change:activeFrameModel', this._displayVideo, this);

    this._userDesires.unbind('change:playbackStatus', this._changePlaybackStatus, this);
    this._userDesires.unbind('change:currentTimePct', this._seekByPct, this);
    this._userDesires.unbind('change:mute', this._changeMute, this);
    this._userDesires.unbind('change:volume', this._changeVolume, this);
    this._userDesires.unbind('change:guideShown', this._guideVisibilityChange, this);
    
    _.each(this._playerViews, function(playerView){
      playerView.playerState.unbind("change:playerLoaded", this._preventPlayerBootstrapGlitch, this);
    }, this);
  },

	//literally display the video (via a video player) and, unless autostart = false, start playing that video
  _displayVideo: function(guideModel, frame){
    var self = this;

    //find next player view
    var video = frame.get('video');
		var view = this._playerViews[video.get('provider_name')];
		
		if(!view){
			//TODO: handle ERROR
			return;
		}
		
		if( this._curView != view ){
			//old view's leave() will only tear itself down if necessary
			if( this._curView && this._curView.leave ){ this._curView.leave(); }
			
			//render will bootstrap or just show itself
			//on bootstrap, it *may* autoplay if this._playbackState.get('autoplayOnVideoDisplay')
			view.render(this.$el, video);
			this._curView = view;
			
			this._playbackState.set({activePlayerState: view.playerState});
		}
		
		if( this._playbackState.get('autoplayOnVideoDisplay') ){
			//if bootstrapping, player *may* be in autoplay mode, but is not required to be
			//when not bootstrapping/autplaying, this is the only way video is set & played
			this._curView.playVideo(video);
		}

  },


	//--------------------------------------
	// Handle user desires
	//--------------------------------------
	
	_changePlaybackStatus: function(attr, state){
		if( !this._curView ) return;
		
		switch(state){
			case libs.shelbyGT.PlaybackStatus.paused:
				this._curView.pause();
				break;
			case libs.shelbyGT.PlaybackStatus.playing:
				this._curView.play();
				break;
		}
	},
	
	_seekByPct: function(attr, seekPct){
		if( !this._curView ) return;
		
		this._curView.seekByPct(seekPct);
	},
	
	_changeMute: function(attr, mute){
		if( !this._curView ) return;
		
		mute ? this._curView.mute() : this._curView.unMute();
	},
	
	_changeVolume: function(attr, volPct){
		if( !this._curView || !this._curView.setVolume ) return;
		
		this._curView.setVolume(volPct);
	},

  _guideVisibilityChange: function(attr, guideShown){
    if( guideShown ){
      this.$el.removeClass("full-width");
    } else {
      this.$el.addClass("full-width");
    }
  },

  // A timing issue exists due to the fact that player bootstrapping is asynchronous...
  // - player A is bootstrapped, and before it loads, player B starts.  player A.leave() doesn't
  //   do anything b/c bootstrap isn't done yet.
  // Fix:
  // - When player A boostrap is done, it sets playerLoaded:true.  We listen for that, and if the player
  //   reporting loaded isn't our current expected player, we ask it to leave() again.
  _preventPlayerBootstrapGlitch: function(playerState, val){
    if( this._curView !== playerState.get('playerView') ){
      playerState.get('playerView').leave();
    }
  }
});
