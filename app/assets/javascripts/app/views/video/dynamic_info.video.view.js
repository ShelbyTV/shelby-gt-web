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
    "click .js-likes-section"          : "_navigateToLikes",
    "click .js-share-menu"              : "_toggleShareMenu",
    "click .js-button_share--email"     : "_requestFrameEmailView",
    "click .js-button_share--facebook"  : "_shareCurrentToFacebook",
    "click .js-close-dvi"               : "_hideDVI"
  },

  initialize: function(){
    Backbone.Events.bind('userHook:partialWatch', this._onPartialWatch, this);
    Backbone.Events.bind('userHook:completeWatch', this._onCompleteWatch, this);
    Backbone.Events.bind('userHook:like', this._onLike, this);
    Backbone.Events.bind('userHook:roll', this._onRoll, this);

    this._currentFrame = this.options.guide.get('activeFrameModel');
    this._currentVideoInfo = libs.utils.VideoPlaybackEvents.getCurrentPlayerInfo();
    this._playlistFrameGroupCollection = this.options.playlistManager.get('playlistFrameGroupCollection');

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

      permalink = libs.shelbyGT.viewHelpers.frame.permalink(this._currentFrame);
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
    console.log("activity counts:", this._userActivity);
  },

  _onplaylistFrameGroupCollectionChange : function(playlistManagerModel, playlistFrameGroupCollection){
    this._playlistFrameGroupCollection = playlistFrameGroupCollection;
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
    }, delay);

    // hide it eventually
    setTimeout(function(){
      self._hideDVI();
    }, timeout);
  },

  _hideDVI : function(){
    this._displayedDVI = false;
    this.$el.removeClass('visible '+this._cardType);
  },

  /*************************************************************
  / HOOKS
  /*************************************************************/
  _onPartialWatch : function(){
    // update user activity
    this._userActivity.set('partialWatchCount', this._userActivity.get('partialWatchCount') + 1);

    // don't always show this, should not be probabilistic in the end. should be "smart"
    if (!this._shouldShowDVI(1)) return;

    this._cardType = this._videoAlreadyLiked(this._currentFrame) ? 'share' : this._chooseRandom(0.5, 'like', 'share');
    var _timeout = (this._currentVideoInfo && this._currentVideoInfo.duration) ? (this._currentVideoInfo.duration - this._currentVideoInfo.currentTime) * 800 : 6000;

    this._showCard(0, _timeout);
  },

  _onCompleteWatch : function(){
    // update user activity
    this._userActivity.set('completeWatchCount', this._userActivity.get('completeWatchCount') + 1);
  },

  _onLike : function(){
    // update user activity
    this._userActivity.set('likeCount', this._userActivity.get('likeCount') + 1);

    // don't always show this, should not be probabilistic in the end. should be "smart"
    if (!this._shouldShowDVI(1)) return;

    this._cardType = 'liked-share';
    var _delay, _timeout;
    _delay = this._currentVideoInfo && this._currentVideoInfo.duration ? this._currentVideoInfo.duration - this._currentVideoInfo.currentTime >= 5 ? 2000 : 0 : 2000;
    _timeout = this._currentVideoInfo && this._currentVideoInfo.duration ? (this._currentVideoInfo.duration - this._currentVideoInfo.currentTime) * 800 : 5000;

    this._showCard(_delay, _timeout);
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

  _toggleShareMenu : function(){
    var $this = this.$('.js-share-menu'),
        block = $this.siblings('.js-share-menu-block'),
        blockHasClass = block.hasClass('hidden');

    // if we're opening the menu and we don't have the shortlink
    // yet, we need to get it now
    if (blockHasClass && !this._currentFrameShortlink) {
      this._getFrameShortlink();
    }

    //  toggle the "button pressed" state
    // $this.toggleClass('button_default',!blockHasClass)
    //      .toggleClass('button_gray-light',blockHasClass);
    $this.toggleClass('button_active',blockHasClass);

    //  show/hide the panel
    block.toggleClass('hidden',!blockHasClass);

    // if we open the menu and we already have the shortlink,
    // highlight it
    if (blockHasClass && this._currentFrameShortlink) {
      this.$('.js-frame-shortlink').select();
    }

  },

  _getFrameShortlink : function() {
    var self = this;
    var $shortlinkTextInput = this.$('.js-frame-shortlink');
    // fetch the short link
    $.ajax({
      url: 'http://api.shelby.tv/v1/frame/'+this._currentFrame.id+'/short_link',
      dataType: 'jsonp',
      success: function(r){
        $shortlinkTextInput.val(r.result.short_link).select();
        // save the link for future reference in case we are going to
        // re-render without changing frames
        self._currentFrameShortlink = r.result.short_link;
      },
      error: function(){
        $shortlinkTextInput.val("Link Unavailable").select();
      }
    });
  },

  _likeFrame : function(el){
    if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.QUEUE) ){
      // do like
      this._currentFrame.like({likeOrigin: this.options.eventTrackingCategory});
      // update UI that like occured
      var $target = $(el.currentTarget);
      $target.toggleClass('queued js-queued').find('.label').text('Liked');
      $target.find('i').addClass('icon-heart--red');
    }
  },

  _shareCurrentToFacebook : function(e){
    var _frame = this._currentFrame;
    var _caption;
    if (shelby.config.hostName) {
      _caption = 'a video from '+shelby.config.hostname;
    } else if (_frame.has('roll')) {
      if (_frame.get('roll').has('subdomain')) {
        _caption = 'a video from '+_frame.get('roll').get('subdomain')+'.shelby.tv';
      } else {
        _caption = 'a video from shelby.tv';
      }
    }
    else {
      _caption = 'a video found with Shelby Video Search';
    }

    var rollCreatorId = this._currentFrame.has('roll') && this._currentFrame.get('roll').has('creator_id') && this._currentFrame.get('roll').get('creator_id');
    var specialConfig = _(shelby.config.dotTvNetworks.dotTvCuratorSpecialConfig).findWhere({id: rollCreatorId});
    var description = _frame.get('video').get('description');

    // if there is a special message for the facebook share, use it
    if (specialConfig && specialConfig.customShareMessages && specialConfig.customShareMessages.facebook) {
      description = specialConfig.customShareMessages.facebook;
    }

    if (typeof FB != "undefined"){
      FB.ui(
        {
          method: 'feed',
          name: _frame.get('video').get('title'),
          link: libs.shelbyGT.viewHelpers.frame.permalink(_frame),
          picture: _frame.get('video').get('thumbnail_url'),
          description: description,
          caption: _caption
        },
        function(response) {
          if (response && response.post_id) {
            // TODO:we should record that this happened.
          }
        }
      );
    }
  },

  _requestFrameEmailView : function(){
    this.options.guideOverlayModel.switchOrHideOverlay(libs.shelbyGT.GuideOverlayType.share, this._currentFrame);
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
