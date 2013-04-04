/*
 *
 * Display dynamic information related to the current playing video
 *
 */
libs.shelbyGT.DynamicVideoInfoView = Support.CompositeView.extend({

  _previousFrame : null,
  _currentFrameShortlink : null,

  options : {
    eventTrackingCategory : 'Dynamic Video Info' // what category events in this view will be tracked under
  },

  events : {
    "click .js-share-menu"          : "_toggleShareMenu"
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
    var permalink,
          tweetIntentParams = {};
    if (this._currentFrame){
      permalink = libs.shelbyGT.viewHelpers.frame.permalink(this._currentFrame);
      tweetIntentParams = {
        text : 'Check out this video',
        url : permalink
      };

      this.$el.html(this.template({
        currentFrame           : this._currentFrame,
        previousFrame         : this._previousFrame,
        tweetIntentQueryString : $.param(tweetIntentParams),
        frameRelativeTo       : (opts && opts.frameRelativeTo) ? opts.frameRelativeTo : "current",
        type                         : (opts && opts.type) ? opts.type : null,
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
    var _type = Math.random() <= 0.5 ?  'like' : 'share';
    var _timeout = _type == 'share' ? 7000 : 5000;

    this.render({type: _type, frameRelativeTo: "current"});
    this.$el.toggleClass('visible', !this.$el.hasClass('visible'));

    setTimeout(function(){
      self.$el.toggleClass('visible', !self.$el.hasClass('visible'));
    }, _timeout);
  },

  _onCompleteWatch : function(){
    console.log("completeWatch hook!");
    // show
    this.$el.toggleClass('visible', !this.$el.hasClass('visible'));
    // prompt to like previousVideo

    // hide
    setTimeout(function(){
      self.$el.toggleClass('visible', !self.$el.hasClass('visible'));
    }, 4000);
  },

  _onLike : function(){
    console.log("like hook");
    this.$el.toggleClass('visible');
  },

  _onRoll : function(){
    console.log("roll hook");
    this.$el.toggleClass('visible');
  },

  /*************************************************************
  / ACTIONS
  /*************************************************************/
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

  _likeFrame : function(frame, el){
    if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.QUEUE) ){
      // do like
      frame.like({likeOrigin: this.options.eventTrackingCategory});
      // update UI that like occured
      // var $target = $(el.currentTarget);
      // $target.toggleClass('queued js-queued').find('.label').text('Liked');
      // $target.find('i').addClass('icon-heart--red');
    }
  }

});
