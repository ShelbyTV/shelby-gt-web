/*
 *
 * Display information about the current video and the next video across the bottom of the video player area.
 *
 */
libs.shelbyGT.PersistentVideoInfoView = Support.CompositeView.extend({

  _currentConcertInfoIndex : 0,

  _supplementalInfoView : null,

  events : {
    "click .persistent_video_info__current-frame  .js-roll-frame"                 : "_requestCurrentFrameRollView",
    "click .persistent_video_info__next-frame     .js-roll-frame"                 : "_requestNextFrameRollView",
    "click .persistent_video_info__current-frame  .js-share-frame"                : "_requestCurrentFrameShareView",
    "click .persistent_video_info__next-frame     .js-share-frame"                : "_requestNextFrameShareView",
    "click .persistent_video_info__current-frame  .js-queue-frame:not(.queued)"   : "_queueCurrentFrame",
    "click .persistent_video_info__next-frame     .js-queue-frame:not(.queued)"   : "_queueNextFrame",
    "click .persistent_video_info__current-frame  .js-comment-frame"              : "_commentCurrentFrame",
    "click .persistent_video_info__next-frame     .js-comment-frame"              : "_commentNextFrame",
    "click .js-next-video"                                                        : "_skipToNextVideo"
  },

  initialize: function(opts){
    this._userDesires = opts.userDesires;
    this.options.guide.bind('change:activeFrameModel', this._onActiveFrameModelChange, this);
    Backbone.Events.bind("change:playingFrameGroupCollection", this._onPlayingFrameGroupCollectionChange, this);
    this.options.playbackEventControllerModel.bind('enter:recurring:' + libs.shelbyGT.PlaybackEventModelTypes.concertInfo, this._onStartConcertInfoEvents, this);
    this.options.playbackEventControllerModel.bind('enter:' + libs.shelbyGT.PlaybackEventModelTypes.concertInfo, this._onConcertInfoEventEntered, this);
    this.options.playbackEventControllerModel.bind('exit:' + libs.shelbyGT.PlaybackEventModelTypes.concertInfo, this._onConcertInfoEventExited, this);
  },

  _cleanup : function() {
    this.options.guide.unbind('change:activeFrameModel', this._onActiveFrameModelChange, this);
    Backbone.Events.unbind("change:playingFrameGroupCollection", this._onPlayingFrameGroupCollectionChange, this);
    this.options.playbackEventControllerModel.unbind('enter:recurring:' + libs.shelbyGT.PlaybackEventModelTypes.concertInfo, this._onStartConcertInfoEvents, this);
    this.options.playbackEventControllerModel.unbind('enter:' + libs.shelbyGT.PlaybackEventModelTypes.concertInfo, this._onConcertInfoEventEntered, this);
    this.options.playbackEventControllerModel.unbind('exit:' + libs.shelbyGT.PlaybackEventModelTypes.concertInfo, this._onConcertInfoEventExited, this);
  },

  template : function(obj) {
    try {
      return SHELBYJST['video/persistent-video-info'](obj);
    } catch(e){
      console.log(e.message, e.stack, obj);
    }
  },

  render : function() {
    if(this._currentFrame && this._playingFrameGroupCollection){
      this._nextFrame = this._playingFrameGroupCollection.getNextPlayableFrame(this._currentFrame, 1, true);
    }

    if(this._currentFrame && this._nextFrame){
      this._leaveChildren();
      this._supplementalInfoView = null;
      this.$el.html(this.template({
        currentFrame: this._currentFrame,
        nextFrame: this._nextFrame,
        queuedVideosModel: this.options.queuedVideos
      }));
    }
  },

  _onActiveFrameModelChange : function(guideModel, activeFrameModel){
    this._currentFrame = activeFrameModel;
    this.render();
  },

  _onPlayingFrameGroupCollectionChange : function(playingFrameGroupCollection){
    this._playingFrameGroupCollection = playingFrameGroupCollection;
    this.render();
  },

  /*************************************************************
   * Button events
   *************************************************************/
  _requestCurrentFrameRollView : function(){
    this._requestFrameRollView(this._currentFrame);
  },

  _requestNextFrameRollView : function(){
    this._requestFrameRollView(this._nextFrame);
  },

  _requestFrameRollView : function(frame){
    if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.ROLL) ){
      this.options.guideOverlayModel.switchOrHideOverlay(libs.shelbyGT.GuideOverlayType.rolling, frame);
    }
  },

  _requestCurrentFrameShareView : function(){
    if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.ROLL) ){
      this._requestFrameShareView(this._currentFrame);
    }
  },

  _requestNextFrameShareView : function(){
    if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.ROLL) ){
      this._requestFrameShareView(this._nextFrame);
    }
  },

  _requestFrameShareView: function(frame){
    if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.COMMENT) ){
      this.options.guideOverlayModel.switchOrHideOverlay(libs.shelbyGT.GuideOverlayType.share, frame);
    }
  },

  _queueCurrentFrame : function(el){
    this._queueFrame(this._currentFrame, el);
  },

  _queueNextFrame : function(el){
    this._queueFrame(this._nextFrame, el);
  },

  _queueFrame : function(frame, el){
    if( shelby.views.anonBanner.userIsAbleTo(libs.shelbyGT.AnonymousActions.QUEUE) ){
      frame.saveToWatchLater();
      $(el.currentTarget).toggleClass('queued js-queued').find('.js-command-icon').text('Queued');
    }
  },

  _commentCurrentFrame : function(el){
    this._commentFrame(this._currentFrame, el);
  },

  _commentNextFrame : function(el){
    this._commentFrame(this._nextFrame, el);
  },

  _commentFrame : function(frame, el){
    //comment frame func
    this.options.guideOverlayModel.switchOrHideOverlay(libs.shelbyGT.GuideOverlayType.conversation, frame);
  },

  _skipToNextVideo : function(){
    this._userDesires.set('changeVideo', 1);
    this._userDesires.unset('changeVideo');
  },

  _onStartConcertInfoEvents : function(event) {
    // look up concert info for the current frame
    var self = this;

    var oArgs = {
      app_key : 'fs6tqWdGP5Cn5zvP',
      q : event.get('concert_query') || this._currentFrame.get('video').get('title'),
      page_size : 25,
      sort_order : 'date',
      include : "links, price"
    };

    shelby.collections.eventfulEventCollection.reset([]);
    this._currentConcertInfoIndex = 0;
    EVDB.API.call("/events/search", oArgs, function(oData){
      var eventResult;
      if (oData.events) {
        eventResult = oData.events.event ;
        if (!$.isArray(eventResult)) {
          eventResult = [eventResult];
        }
      } else {
        eventResult = [];
      }
      shelby.collections.eventfulEventCollection.reset(eventResult);
      self._currentConcertInfoIndex = 0;
    });
  },

  _onConcertInfoEventEntered : function(event){
    var concertInfo = shelby.collections.eventfulEventCollection.at(this._currentConcertInfoIndex);
    this._currentConcertInfoIndex = ++this._currentConcertInfoIndex % shelby.collections.eventfulEventCollection.length;
    if (concertInfo) {
      if (!this._supplementalInfoView) {
        this._supplementalInfoView = new libs.shelbyGT.PersistentInfoSupplementalView();
        this._supplementalInfoView.model = concertInfo;
        this.appendChild(this._supplementalInfoView);
      } else {
        this._supplementalInfoView.model = concertInfo;
        this._supplementalInfoView.render();
      }
      this.$('.js-standard-video-info').hide();
      this.$('.js-supplemental-video-info').show();
    }
  },

  _onConcertInfoEventExited : function(event){
    this.$('.js-supplemental-video-info').hide();
    this.$('.js-standard-video-info').show();
  }

});