( function(){

  var FrameGroupView = libs.shelbyGT.FrameGroupView;

  libs.shelbyGT.ContextOverlayView = FrameGroupView.extend({

    el: '#js-context-overlay-lining',

    options : _.extend({}, libs.shelbyGT.FrameGroupView.prototype.options, {
      contextOverlay : true
    }),

    initialize : function(data) {
      this.options.contextOverlayState.bind('change:playingFrameGroup', this._onPlayingFrameGroupChange, this);
      this.options.playbackState.bind('change:activePlayerState', this._onNewPlayerState, this);
    },

    _cleanup : function(){
      this.options.contextOverlayState.unbind('change:playingFrameGroup', this._onPlayingFrameGroupChange, this);
      this.options.playbackState.unbind('change:activePlayerState', this._onNewPlayerState, this);
      if (this.model) {
        this._setupTeardownModelBindings(this.model, false);
      }
    },
    
    _onNewPlayerState: function(playbackState, newPlayerState){
      var prevPlayerState = playbackState.previous('activePlayerState');
      if( prevPlayerState ){
        prevPlayerState.unbind('change:playbackStatus', this._onPlaybackStatusChange, this);
      }
      newPlayerState.bind('change:playbackStatus', this._onPlaybackStatusChange, this);
    },

    _onPlayingFrameGroupChange : function(contestOverlayStateModel, playingFrameGroup){
      //unbind
      if (this.model) {
        this._setupTeardownModelBindings(this.model, false);
      }

      this.model = playingFrameGroup;

      //bind
      this._setupTeardownModelBindings(this.model, true);

      this.render();
    },
    
    _onPlaybackStatusChange : function(attr, curState){
      if(curState === libs.shelbyGT.PlaybackStatus.playing){
        $("#guide-nowplaying-label").removeClass("paused");
      } else {
        $("#guide-nowplaying-label").addClass("paused");
      }
    },

    _setupTeardownModelBindings : function(model, bind) {
      var action;
      if (bind) {
        action = 'bind';
      } else {
        action = 'unbind';
      }

      var groupFirstFrame = model.getFirstFrame();
      if (groupFirstFrame) {
        groupFirstFrame[action]('change', this.render, this);
        groupFirstFrame.get('conversation') && groupFirstFrame.get('conversation')[action]('change', this.render, this);
      }
      model[action]('change', this.render, this);
      shelby.models.queuedVideos[action]('add:queued_videos', this._onQueuedVideosAdd, this);
      shelby.models.queuedVideos[action]('remove:queued_videos', this._onQueuedVideosRemove, this);
    },

    render : function() {
      if (this.model) {
        this.$el.html(this.template({ queuedVideosModel : shelby.models.queuedVideos, frameGroup : this.model, frame : this.model.getFirstFrame(), options : this.options }));
        var videoTitle = this.model.getFirstFrame() && this.model.getFirstFrame().get('video') && this.model.getFirstFrame().get('video').get('title');
        $("#guide-nowplaying-label .video-title").text( videoTitle || 'Now Playing');
        $("#js-guide-nowplaying").show();
      } else {
        this.$el.html('');
        $("#js-guide-nowplaying").hide();
      }
      
    },

    template : function(obj) {
      return SHELBYJST['frame'](obj);
    }

  });

} ) ();
