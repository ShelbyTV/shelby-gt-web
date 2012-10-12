( function(){

  libs.shelbyGT.PrerollVideoInfoView = Support.CompositeView.extend({
    
    _playbackState: null,
    
    _renderedAt: null,

    initialize : function(opts) {
      this._playbackState = opts.playbackState;
      
      this.options.guide.bind('change:activeFrameModel', this._onActiveFrameModelChange, this);
      this._playbackState.bind('change:activePlayerState', this._onNewPlayerState, this);
    },

    _cleanup : function(){
      this.options.guide.unbind('change:activeFrameModel', this._onActiveFrameModelChange, this);
      this._playbackState.unbind('change:activePlayerState', this._onNewPlayerState, this);
    },

    _onActiveFrameModelChange : function(guideModel, activeFrameModel){
      this.model = activeFrameModel;
      this.render();
      this._renderedAt = Date.now();
    },
    
    _onNewPlayerState: function(playbackState, newPlayerState){
      var prevPlayerState = playbackState.previous('activePlayerState');
      if( prevPlayerState ){
        prevPlayerState.unbind('change:currentTime', this._onCurrentTimeChange, this);
      }
      newPlayerState.bind('change:currentTime', this._onCurrentTimeChange, this);
    },
    
    // hide overlay 1s into video or 4s from initial dislay, whichever is greater
    _onCurrentTimeChange: function(attr, time){
      if(time > 1.0 && Date.now() > (this._renderedAt + 4*1000)){ 
        this.$el.removeClass('showing').addClass("post-display");
      }
    },

    render : function() {
      this.$el.removeClass("post-display");
      if (this.model) {
        this.$el.html( this.template({ frame: this.model }) );
        this.$el.addClass("showing");
      } else {
        this.$el.html('');
      }
    },

    template : function(obj) {
      return SHELBYJST['preroll-video-info'](obj);
    }
    
  });

} ) ();