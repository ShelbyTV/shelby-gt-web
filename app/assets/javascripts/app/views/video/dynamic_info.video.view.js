/*
 *
 * Display dynamic information related to the current playing video
 *
 */
libs.shelbyGT.DynamicVideoInfoView = Support.CompositeView.extend({

  _previousFrame : null,
  _currentFrameShortlink : null,
  _displayedDVI : false,

  options : {
    eventTrackingCategory : 'Dynamic Video Info' // what category events in this view will be tracked under
  },

  events : {
    "click .js-like-frame"          : "_likeFrame",
    "click .js-share-menu"          : "_toggleShareMenu",
    "click .js-close-dvi"           : "_closeDVI"
  },

  initialize: function(){
    Backbone.Events.bind('userHook:partialWatch', this._onPartialWatch, this);
    Backbone.Events.bind('userHook:completeWatch', this._onCompleteWatch, this);
    Backbone.Events.bind('userHook:like', this._onLike, this);
    Backbone.Events.bind('userHook:roll', this._onRoll, this);

    this._currentFrame = this.options.guide.get('activeFrameModel');
    this._playlistFrameGroupCollection = this.options.playlistManager.get('playlistFrameGroupCollection');

    this.options.guide.bind('change:activeFrameModel', this._onActiveFrameModelChange, this);
    this.options.playlistManager.bind("change:playlistFrameGroupCollection", this._onplaylistFrameGroupCollectionChange, this);
  },

  _cleanup : function() {
    Backbone.Events.unbind('userHook:partialWatch', this._onPartialWatch, this);
    Backbone.Events.unbind('userHook:completeWatch', this._onCompleteWatch, this);
    Backbone.Events.unbind('userHook:like', this._onLike, this);
    Backbone.Events.unbind('userHook:roll', this._onRoll, this);

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
    var permalink, tweetIntentParams = {};

    if (this._currentFrame){
      permalink = libs.shelbyGT.viewHelpers.frame.permalink(this._currentFrame);
      tweetIntentParams = {
        text : 'Check out this video',
        url : permalink
      };

      this.$el.html(this.template({
        currentFrame            : this._currentFrame,
        previousFrame           : this._previousFrame,
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
    //this._previousFrame = this._currentFrame;
    this._currentFrame = activeFrameModel;
    // current frame changed, so we don't have the right shortlink anymore
    this._currentFrameShortlink = null;
    this.render();
  },

  _onplaylistFrameGroupCollectionChange : function(playlistManagerModel, playlistFrameGroupCollection){
    this._playlistFrameGroupCollection = playlistFrameGroupCollection;
    //TODO : the menu should stay open and we don't need to reload the shortlink
    this.render();
  },

  /*************************************************************
  / HOOKS
  /*************************************************************/
  _onPartialWatch : function(){
    var self = this;
    // don't always show this, should not be probabilistic in the end. should be "smart"
    if (!this._shouldShowDVI(1)) return;
    this._displayedDVI = true;

    var _type = this._videoAlreadyLiked(this._currentFrame) ? 'share' : this._chooseRandom(0.5, 'like', 'share');
    var _timeout = this._currentFrame.get('video').get('duration')*200;

    // show it now
    this.render({type: _type, frameRelativeTo: "current"});
    this.$el.addClass('visible '+_type);
    // hide it eventually
    setTimeout(function(){
      self._closeDVI();
    }, _timeout);
  },

  _onCompleteWatch : function(){
    console.log("completeWatch hook!");
  },

  _onLike : function(){
    var self = this;
    // don't always show this, should not be probabilistic in the end. should be "smart"
    if (!this._shouldShowDVI(1)) return;

    var _type = 'share';
    var _delay = this._currentFrame.get('video').get('duration')*500;
    var _timeout = this._currentFrame.get('video').get('duration')*300;

    // show it after a slight delay
    this.render({type: _type, frameRelativeTo: "current"});
    setTimeout(function(){
      self.$el.addClass('visible '+_type);
    }, _delay);
    // hide it eventually
    setTimeout(function(){
      self._closeDVI(_type);
    }, _timeout);
  },

  _onRoll : function(){
    console.log("roll hook");
  },

  /*************************************************************
  / ACTIONS
  /*************************************************************/
  _closeDVI : function(type){
    this.$el.removeClass('visible '+type);
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

  /*************************************************************
  / HELPER
  /*************************************************************/
  _shouldShowDVI : function(probability){
    var _byProb = this._chooseRandom(probability, true, false);
    var _byDuration = this._currentFrame.get('video').get('duration');
    return (!this._displayedDVI && _byProb && _byDuration > 10);
  },

  _videoAlreadyLiked : function(currentFrame) {
    return this.options.queuedVideos.videoIsInQueue(currentFrame.get('video'));
  },

  _chooseRandom : function(probability, option1, option2){
    return Math.random() <= probability ? option1 : option2;
  }
});
