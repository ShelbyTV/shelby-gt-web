/*
 *
 * Display dynamic information related to the current playing video
 *
 */
libs.shelbyGT.DynamicVideoInfoView = Support.CompositeView.extend({

  _currentFrameShortlink : null,

  options : {
    eventTrackingCategory : 'Dynamic Video Info' // what category events in this view will be tracked under
  },

  events : {

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

    this.render();
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

  render : function() {
    //TODO FIXME
    this.$el.html(this.template({
      currentFrame           : this._currentFrame,
      eventTrackingCategory  : this.options.eventTrackingCategory,
      queuedVideosModel      : this.options.queuedVideos,
      showNextFrame          : this.options.showNextFrame,
      user                   : shelby.models.user
    }));
  },

  _onActiveFrameModelChange : function(guideModel, activeFrameModel){
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
    console.log("partialWatch hook");
    this.$el.toggleClass('visible', !this.$el.hasClass('visible'));
    setTimeout(function(){
      self.$el.toggleClass('visible', !self.$el.hasClass('visible'));
    }, 4000);
  },

  _onCompleteWatch : function(){
    console.log("completeWatch hook");
    this.$el.toggleClass('visible');
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
  / HOOKS
  /*************************************************************/
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
