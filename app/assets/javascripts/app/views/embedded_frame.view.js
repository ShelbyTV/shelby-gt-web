/*

*/
libs.shelbyGT.EmbeddedFrameView = Support.CompositeView.extend({

  events : {
    "click .js-start-playback"        : "_startPlayback",
    "click .js-creator-personal-roll" : "_openCreatorPersonalRoll",
    "click .js-has-shortlink-value"   : "_selectInputContent",
    "click .js-facebook-share"        : "_facebookShare",
    "click .js-twitter-share"         : "_twitterShare"
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
    this.$(".embed_board").toggleClass("embed_board--unplayed", false);
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
    var embedBoard = this.$(".embed_board");
    
    switch(curState){
      case libs.shelbyGT.PlaybackStatus.paused:
        shelby.userInactivity.disableUserActivityDetection();
        embedBoard.toggleClass("embed_board--paused", true);
        embedBoard.toggleClass("embed_board--complete", false);
        break;
      case libs.shelbyGT.PlaybackStatus.playing:
        shelby.userInactivity.enableUserActivityDetection();
        embedBoard.toggleClass("embed_board--paused", false);
        embedBoard.toggleClass("embed_board--complete", false);
        break;
      case libs.shelbyGT.PlaybackStatus.ended:
        shelby.userInactivity.disableUserActivityDetection();
        embedBoard.toggleClass("embed_board--paused", false);
        embedBoard.toggleClass("embed_board--complete", true);
        break;
    }
  },
  
  _openCreatorPersonalRoll : function(){
    var creator = this.model.get('creator');
    window.open("http://shelby.tv/user/"+creator.id+"/personal_roll", "shelby", "");
    return false;
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
  },
  
  _facebookShare : function(){
    if (typeof FB != "undefined"){
      FB.ui(
        {
          method: 'feed',
          display: 'popup',
          name: this.model.get('creator').get('nickname')+".shelby.tv",
          link: this.shortlink,
          picture: this.model.get('video').get('thumbnail_url'),
          description: "I’m watching \""+this.model.get('video').get('title')+"\" on @Shelby"
        },
        function(response) {
          if (response && response.post_id) {
            // TODO:we should record that this happened.
          }
        }
      );
    }
    return false;
  },
  
  _twitterShare : function(){
    var url = "https://twitter.com/intent/tweet?text=I%E2%80%99m+watching+\""+encodeURIComponent(this.model.get('video').get('title'))+"\"+via+%40Shelby&url="+this._shortlink;
    window.open(url, "twitterShare", "");
    return false;
  }
  
});