/*

*/
libs.shelbyGT.EmbeddedFrameView = Support.CompositeView.extend({

  events : {
    "click .js-start-playback"        : "_startPlayback",
    "click .js-creator-personal-roll" : "_openCreatorPersonalRoll",
    "click .js-has-shortlink-value"   : "_selectInputContent"
  },
  
  initialize : function(opts){
    this._playbackState = opts.playbackState;
    this._guide = opts.guide;
    
    this._playbackState.bind('change:activePlayerState', this._onNewPlayerState, this);
    
    //fallback shortlink
    this._shortlink = "http://"+this.model.get('creator').get('nickname')+"shelby.tv";
    this._prefetchShortlink();
    
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
      creator: this.model.get('creator'),
      shortlink: this._shortlink
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
  },
  
  _prefetchShortlink : function(){
    var self = this;
    $.ajax({
      url: 'http://api.shelby.tv/v1/frame/'+this.model.id+'/short_link',
      dataType: 'jsonp',
      success: function(r){
        self._shortlink = r.result.short_link;
        self.$(".js-has-shortlink-value").attr('value', self._shortlink);
      },
      error: function(){
        //ignoring, shortlink is just profile page which is fine for fallback
      }
    });
  },
  
  _selectInputContent : function(el){
    $(el.currentTarget).select();
  }
  
});