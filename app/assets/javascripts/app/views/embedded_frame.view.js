/*
 * Displays a single frame suitable for embeddedin via an iframe.
 *
 * Example iFrame embed code:
 * <iframe width="560" height="415"
 *  src="http://shelby.tv/embed/:frame_id?footer=1"
 *  frameborder="0" allowfullscreen></iframe>
 *
 * Rendered via views/turbo_embed/embed.html.erb (inside the embed layout) which loads the
 * full app where the DynamicRouter creates one of these EmbeddedFrameView.
*/
libs.shelbyGT.EmbeddedFrameView = Support.CompositeView.extend({

  _hasRenderedVideo: false,

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

    //mobile video doesn't auto-play
    //first user tap will (1) hide our unplayed board and (2) start video playing
    if(Browser.isMobile()){
      this._renderVideo();
    }
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
    if(!this._hasRenderedVideo){
      this._hasRenderedVideo = true;

      //this guys does all the video work
      this.renderChildInto(new libs.shelbyGT.VideoContentPaneView({
                            guide : this._guide,
                            playbackState : this._playbackState,
                            }),
                            this.$("#js-video-section"));

      //setting the active frame starts playback
      this._guide.set({activeFrameModel: this.model});
    }
  },

  _onNewPlayerState: function(playbackState, newPlayerState){
    newPlayerState.bind('change:playbackStatus', this._onPlaybackStatusChange, this);
  },

  _onPlaybackStatusChange: function(attr, curState){
    var embedBoard = this.$(".embed_board"),
    videoPlayer = this.$("#js-video-section .videoplayer-viewport"),
    backgroundThumb = this.$(".preview-video-thumbnail");
    videoPlayer.show();

    switch(curState){
      case libs.shelbyGT.PlaybackStatus.paused:
        shelby.userInactivity.disableUserActivityDetection();
        embedBoard.toggleClass("embed_board--unplayed", false);
        embedBoard.toggleClass("embed_board--paused", true);
        embedBoard.toggleClass("embed_board--complete", false);
        backgroundThumb.hide();
        break;
      case libs.shelbyGT.PlaybackStatus.playing:
        shelby.userInactivity.enableUserActivityDetection();
        embedBoard.toggleClass("embed_board--unplayed", false);
        embedBoard.toggleClass("embed_board--paused", false);
        embedBoard.toggleClass("embed_board--complete", false);
        backgroundThumb.hide();
        break;
      case libs.shelbyGT.PlaybackStatus.ended:
        shelby.userInactivity.disableUserActivityDetection();
        embedBoard.toggleClass("embed_board--unplayed", false);
        embedBoard.toggleClass("embed_board--paused", false);
        embedBoard.toggleClass("embed_board--complete", true);
        backgroundThumb.show();
        videoPlayer.hide();
        break;
    }
  },

  _openCreatorPersonalRoll : function(){
    var creator = this.model.get('creator'),
    url;
    if(creator.has('nickname')){
      url = "http://"+creator.get('nickname')+".shelby.tv";
    } else {
      url = "http://shelby.tv/user/"+creator.id+"/personal_roll";
    }
    window.open(url, "", "");
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
    return false;
  },

  _facebookShare : function(){
    if (typeof FB != "undefined"){
      var video = this.model.get('video');
      FB.ui(
        {
          caption     : 'Shelby.tv',
          description : video.get('description'),
          display     : 'popup',
          link        : this._shortlink,
          method      : 'feed',
          name        : video.get('title'),
          picture     : video.get('thumbnail_url')
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
    var url = 'https://twitter.com/intent/tweet?related=shelby&via=shelby&url=' + this._shortlink + '&text=' + encodeURIComponent(this.model.get('video').get('title'));
    window.open(url, "twitterShare", "");
    return false;
  }

});