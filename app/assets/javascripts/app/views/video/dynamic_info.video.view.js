/*
 *
 * Display dynamic information related to the current playing video
 *
 */
libs.shelbyGT.DynamicVideoInfoView = Support.CompositeView.extend({

  _previousFrame : null,
  _currentFrameShortlink : null,
  _cardType : null,
  _displayedDVI : false,

  options : {
    eventTrackingCategory : 'Dynamic Video Info' // what category events in this view will be tracked under
  },

  events : {
    "click .js-like-frame"              : "_likeFrame",
    "click .js-likes-section"           : "_navigateToLikes",
    "click .js-button_share--facebook"  : "_shareCurrentToFacebook",
    "click .js-button_share--friend"       : "_shareWithSpecificFriend",
    "click .js-close-dvi"               : "_hideDVI"
  },

  initialize: function(){
    Backbone.Events.bind('userHook:partialWatch', this._onPartialWatch, this);
    Backbone.Events.bind('userHook:completeWatch', this._onCompleteWatch, this);
    Backbone.Events.bind('userHook:like', this._onLike, this);
    Backbone.Events.bind('userHook:roll', this._onRoll, this);

    this._currentFrame = this.options.guide.get('activeFrameModel');
    this._currentVideoInfo = libs.utils.VideoPlaybackEvents.getCurrentPlayerInfo();

    this._userActivity = this.options.userActivityModel;
    this._userActivity.bind('change', this._onUserActivityChange, this);

    this.options.guide.bind('change:activeFrameModel', this._onActiveFrameModelChange, this);
    this.options.playlistManager.bind("change:playlistFrameGroupCollection", this._onplaylistFrameGroupCollectionChange, this);
  },

  _cleanup : function() {
    Backbone.Events.unbind('userHook:partialWatch', this._onPartialWatch, this);
    Backbone.Events.unbind('userHook:completeWatch', this._onCompleteWatch, this);
    Backbone.Events.unbind('userHook:like', this._onLike, this);
    Backbone.Events.unbind('userHook:roll', this._onRoll, this);

    this._userActivity.unbind('change', this._onUserActivityChange, this);

    this.options.guide.unbind('change:activeFrameModel', this._onActiveFrameModelChange, this);
    this.options.playlistManager.unbind("change:playlistFrameGroupCollection", this._onplaylistFrameGroupCollectionChange, this);
  },

  template : function(obj) {
    try {
      return SHELBYJST['video/dynamic-video-info'](obj);
    } catch(e){
      console.log(e.message, e.stack, obj);
    }
  },

  render : function(opts) {
    var permalink, emailBody, tweetIntentParams = {};

    if (this._currentFrame){
      this._displayedDVI = false;

      var _frameGroup = this.options.playlistManager.get('playlistFrameGroupCollection').getFrameGroupByFrameId(this._currentFrame.id);
      if (_frameGroup) {
        permalink = libs.shelbyGT.viewHelpers.frameGroup.contextAppropriatePermalink(_frameGroup);
      } else {
        permalink = libs.shelbyGT.viewHelpers.frame.permalink(this._currentFrame);
      }
      emailBody = permalink + "?utm_campaign=email-share";
      tweetIntentParams = {
        text : 'Check out this video',
        url : permalink
      };

      this.$el.html(this.template({
        currentFrame            : this._currentFrame,
        previousFrame           : this._previousFrame,
        anonUserShareEmailBody : emailBody,
        tweetIntentQueryString  : $.param(tweetIntentParams),
        frameRelativeTo         : (opts && opts.frameRelativeTo) ? opts.frameRelativeTo : "current",
        type                    : (opts && opts.type) ? opts.type : null,
        eventTrackingCategory  : this.options.eventTrackingCategory,
        queuedVideosModel      : this.options.queuedVideos,
        user                   : shelby.models.user
      }));
    }
  },

  _onActiveFrameModelChange : function(guideModel, activeFrameModel){
    this._hideDVI();
    //this._previousFrame = this._currentFrame;
    this._currentFrame = activeFrameModel;
    this._currentVideoInfo = libs.utils.VideoPlaybackEvents.getCurrentPlayerInfo();

    // current frame changed, so we don't have the right shortlink anymore
    this._currentFrameShortlink = null;
    this.render();
  },

  _onplaylistFrameGroupCollectionChange : function(playlistManagerModel, playlistFrameGroupCollection){
    //TODO : the menu should stay open and we don't need to reload the shortlink
    this._hideDVI();
    this.render();
  },

  _showCard : function(delay, timeout){
    var self = this;
    this._displayedDVI = true;

    // render it initially hiden and show after a potential delay
    this.render({type: this._cardType, frameRelativeTo: "current"});

    setTimeout(function(){
      self.$el.addClass('visible '+self._cardType);
      $('.persistent_video_info__wrapper').addClass('half-cloaked');
    }, delay);

    // hide it eventually
    setTimeout(function(){
      self._hideDVI();
    }, timeout);

    // event tracking
    shelby.trackEx({
      providers : ['ga', 'kmq'],
      gaCategory : "Dynamic Video Info",
      gaAction : 'Show card',
      gaLabel : this._cardType,
      kmqName : 'Show DVI '+this._cardType+' card'
    });
  },

  _hideDVI : function(){
    this._displayedDVI = false;
    this.$el.removeClass('visible '+this._cardType);
    $('.persistent_video_info__wrapper').removeClass('half-cloaked');
  },

  /*************************************************************
  / HOOKS
  /*************************************************************/
  _onPartialWatch : function(){
    // update user activity
    this._userActivity.set('partialWatchCount', this._userActivity.get('partialWatchCount') + 1);

    // show email collector if watched 3 videos
    if (this._userActivity.get('partialWatchCount') == 3) {
      setTimeout(function(){
        Backbone.Events.trigger('show:emailCollection');
      }, 1000);
    }

    // don't always show this, should not be probabilistic in the end. should be "smart" eventually
    if (!this._shouldShowDVI(0.1)) return;
    //if (this._videoAlreadyLiked(this._currentFrame)) return;

    this._cardType = 'share';
    var _timeout = (this._currentVideoInfo && this._currentVideoInfo.duration) ? (this._currentVideoInfo.duration - this._currentVideoInfo.currentTime) * 1100 : 8000;

    this._showCard(0, _timeout);
  },

  _onCompleteWatch : function(){
    // update user activity
    this._userActivity.set('completeWatchCount', this._userActivity.get('completeWatchCount') + 1);
  },

  _onLike : function(){
    // update user activity
    this._userActivity.set('likeCount', this._userActivity.get('likeCount') + 1);

    // SHOW email collector
    Backbone.Events.trigger('show:emailCollection');

    // NOT showing DVI right now
    //if (!this._shouldShowDVI(1)) return;
    // this._cardType = 'liked-share';
    // var _delay, _timeout;
    // _delay = this._currentVideoInfo && this._currentVideoInfo.duration ? this._currentVideoInfo.duration - this._currentVideoInfo.currentTime >= 5 ? 2000 : 1000 : 2000;
    // _timeout = this._currentVideoInfo && this._currentVideoInfo.duration ? (this._currentVideoInfo.duration - this._currentVideoInfo.currentTime) * 800 : 10000;

    // this._showCard(_delay, _timeout);
  },

  _onRoll : function(){
    // update user activity
    this._userActivity.set('rollCount', this._userActivity.get('rollCount') + 1);
  },

  /*************************************************************
  / USER ACTIVITY
  /*************************************************************/
  _onUserActivityChange : function(){
    // prompt the user to signup because they're a XXX-er
  },

  /*************************************************************
  / ACTIONS
  /*************************************************************/
  _navigateToLikes : function(){
    shelby.router.navigate('likes', {trigger: true, replace: true});
  },

  _getFrameShortlink : function() {
    var self = this;
    var $mailtoLink = $('.js-button_command--email');
    var fetchShortlinkUrl;
    var frameGroup = this.options.playlistManager.get('playlistFrameGroupCollection').getFrameGroupByFrameId(this._currentFrame.id);
    var dbEntry = frameGroup.get('primaryDashboardEntry');
    if (dbEntry) {
      fetchShortlinkUrl = shelby.config.apiRoot + '/dashboard/' + dbEntry.id + '/short_link';
    } else {
      fetchShortlinkUrl = shelby.config.apiRoot + '/frame/' + this._currentFrame.id + '/short_link';
    }
    // fetch the short link
    $.ajax({
      url: fetchShortlinkUrl,
      dataType: 'jsonp',
      success: function(r){
        self._currentFrameShortlink = r.result.short_link;
      },
      error: function(){  }
    });
  },

  _likeFrame : function(el){
    if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.QUEUE) ){
      // do like
      this._currentFrame.like({likeOrigin: this.options.eventTrackingCategory});
      // update UI that like occured
      var $target = $(el.currentTarget);
      $target.toggleClass('queued js-queued').find('.label').text('Liked');
      $target.find('i').addClass('icon-like--red');
    }
  },

  _shareCurrentToFacebook : function(e){
    if (typeof FB == "undefined") return;
    var self = this;
    //pause video
    shelby.models.userDesires.triggerTransientChange('playbackStatus', libs.shelbyGT.PlaybackStatus.paused);
    FB.ui(
      {
        method: 'send',
        link: libs.shelbyGT.viewHelpers.frame.permalink(self._currentFrame),
      },
      function(response) {
        //play video
        shelby.models.userDesires.triggerTransientChange('playbackStatus', libs.shelbyGT.PlaybackStatus.playing);
        if (response) {
          shelby.trackEx({
            providers : ['ga', 'kmq'],
            gaCategory : "Dynamic Video Info",
            gaAction : 'Sent to a friend via generic share button',
            gaLabel : self._cardType,
            kmqName : 'Sent video to a friend via DVI '+self._cardType+' card'
          });
        }
      }
    );
  },

  _shareWithSpecificFriend : function(el){
    if (typeof FB == "undefined") return;

    var self = this,
          $target = $(el.currentTarget),
          facebookId = $target.data('facebook-id');
    //pause video
    shelby.models.userDesires.triggerTransientChange('playbackStatus', libs.shelbyGT.PlaybackStatus.paused);

    FB.ui({
      method: 'send',
      to: facebookId,
      link: libs.shelbyGT.viewHelpers.frame.permalink(this._currentFrame)
      },
      function(response) {
        //play video
        shelby.models.userDesires.triggerTransientChange('playbackStatus', libs.shelbyGT.PlaybackStatus.playing);

        if (response) {
          shelby.trackEx({
            providers : ['ga', 'kmq'],
            gaCategory : "Dynamic Video Info",
            gaAction : 'Sent to a friend via clicking an avatar',
            gaLabel : self._cardType,
            kmqName : 'Sent video to a specific friend via DVI '+self._cardType+' card'
          });
        }
      }
    );
  },

  /*************************************************************
  / HELPER
  /*************************************************************/
  _shouldShowDVI : function(probability){
    var _byProb = this._chooseRandom(probability, true, false);
    var _byDuration = this._currentFrame.get('video').get('duration') || this._currentVideoInfo.duration;
    return (!this._displayedDVI && _byProb && _byDuration > 10);
  },

  _videoAlreadyLiked : function(currentFrame) {
    return this.options.queuedVideos.videoIsInQueue(currentFrame.get('video'));
  },

  _chooseRandom : function(probability, option1, option2){
    return Math.random() <= probability ? option1 : option2;
  }
});
