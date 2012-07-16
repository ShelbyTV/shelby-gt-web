( function(){

  libs.shelbyGT.PrerollVideoInfoView = Support.CompositeView.extend({

    el: '#js-preroll-video-info-wrapper',
    
    _playbackState: null,

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
    },
    
    _onNewPlayerState: function(playbackState, newPlayerState){
      var prevPlayerState = playbackState.previous('activePlayerState');
      if( prevPlayerState ){
        prevPlayerState.unbind('change:currentTime', this._onCurrentTimeChange, this);
      }
      newPlayerState.bind('change:currentTime', this._onCurrentTimeChange, this);
    },
    
    // hide overlay 1s into video
    _onCurrentTimeChange: function(attr, time){
      if(time > 1){ 
        this.$el.addClass("post-display");
      }
    },

    render : function() {
      this.$el.removeClass('showing').removeClass("post-display");
      this.$el.html( this.template({ frame: this.model }) );
      var self = this;
      self.$el.addClass("showing");
    },

    template : function(obj) {
      return JST['preroll-video-info'](obj);
    }
    
  });

} ) ();