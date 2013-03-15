/*

*/
libs.shelbyGT.EmbeddedFrameView = Support.CompositeView.extend({

  events : {
    "click .js-start-playback"        : "_startPlayback",
    "click .js-creator-personal-roll" : "_openCreatorPersonalRoll"
  },
  
  initialize : function(opts){
    this._playbackState = opts.playbackState;
    this._guide = opts.guide;
    
    this._playbackState.bind('change:activePlayerState', this._onNewPlayerState, this);
    
    this.render();
  },
  
  _cleanup: function() {
    this.model.unbind('change:activePlayerState', this._onNewPlayerState, this);
  },

  template : function(obj){
      return SHELBYJST['embedded-frame'](obj);
  },

  render : function(){
    this.$el.html(this.template({
      frame: this.model,
      video: this.model.get('video'),
      conversation: this.model.get('conversation'),
      creator: this.model.get('creator')
    }));
  },
  
  _startPlayback : function(){
    this.$(".before-play-board").hide();
    this._renderVideo();
  },
  
  _renderVideo : function(){
    //this guys does all the video work
    this.renderChildInto(new libs.shelbyGT.VideoContentPaneView({
                          guide : this._guide,
                          playbackState : this._playbackState,
                          }),
                          this.$("#js-video-section"));

    //setting the active frame starts playback
    this._guide.set({activeFrameModel: this.model});
  },
  
  _onNewPlayerState: function(playbackState, newPlayerState){
    newPlayerState.bind('change:playbackStatus', this._onPlaybackStatusChange, this);
  },
  
  _onPlaybackStatusChange: function(attr, curState){
    switch(curState){
      case libs.shelbyGT.PlaybackStatus.paused:
        shelby.userInactivity.disableUserActivityDetection();
        this.$(".play-paused-board").show();
        break;
      case libs.shelbyGT.PlaybackStatus.playing:
        shelby.userInactivity.enableUserActivityDetection();
        this.$(".play-paused-board").hide();
        this.$(".play-complete-board").hide();
        break;
      case libs.shelbyGT.PlaybackStatus.ended:
        shelby.userInactivity.disableUserActivityDetection();
        this.$(".play-paused-board").hide();
        this.$(".play-complete-board").show();
        break;
    }
  },
  
  _openCreatorPersonalRoll : function(){
    var creator = this.model.get('creator');
    window.open("http://shelby.tv/user/"+creator.id+"/personal_roll", "shelby", "");
  }
  
});