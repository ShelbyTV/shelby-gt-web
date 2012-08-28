libs.shelbyGT.FrameGroupView = libs.shelbyGT.ActiveHighlightListItemView.extend({

  _conversationDisplayed : false,

  _grewForFrameRolling : false,

  _frameRollingView : null,
  
  _conversationView : null,

  _frameSharingInGuideView : null,
  
  options : _.extend({}, libs.shelbyGT.ActiveHighlightListItemView.prototype.options, {
      activationStateProperty : 'activeFrameModel',
      guideOverlayModel : null,
      contextOverlay : false
  }),

  events : {
    "click .js-frame-activate"              : "_activate",
    "click .js-creation-date"               : "_expand",
    "click .js-creator-personal-roll"       : "_goToCreatorsPersonalRoll",
    "click .js-frame-source"                : "_goToSourceRoll",
    "click .js-roll-frame"                  : "requestFrameRollView",
    "click .js-share-frame"                 : "requestFrameShareView",
    "click .js-remove-frame"                : "_removeFrame",
    "click .js-video-activity-toggle"       : "_requestConversationView",
    "click .js-queue-frame:not(.queued)"    : "_onClickQueue",
    "click .js-go-to-roll-by-id"            : "_goToRollById",
    "click .js-go-to-frame-and-roll-by-id"  : "_goToFrameAndRollById"

  },

  className : 'frame',

  template : function(obj){
    try {
      return JST['frame'](obj);
    } catch(e){
      console.log(e.message, e.stack);
    }
  },

  initialize : function() {
    this._setupTeardownModelBindings(this.model, true);
    libs.shelbyGT.ActiveHighlightListItemView.prototype.initialize.call(this);
  },

  _cleanup : function(){
    this._setupTeardownModelBindings(this.model, false);
    libs.shelbyGT.ActiveHighlightListItemView.prototype._cleanup.call(this);
  },

  _onQueuedVideosAdd : function(video){
    this._onAddRemoveQueuedVideo(video);
  },

  _onQueuedVideosRemove : function(video){
    this._onAddRemoveQueuedVideo(video, true);
  },

  _onAddRemoveQueuedVideo : function(video, removeVideo) {
    if (!this.model) return false;
    var frameVideo = this.model.getFirstFrame().get('video');
    if (frameVideo.id == video.id){
      // this video is the one being added/removed
      // in case it got updated from somewhere else like the explore view, update my button
      this.$('.js-queue-frame').toggleClass('queued', !removeVideo);
      this.$('.js-queue-frame button').text(!removeVideo ? 'Queued' : 'Add to Queue');
    }
  },

  _setupTeardownModelBindings : function(model, bind) {
    var action;
    if (bind) {
      action = 'bind';
    } else {
      action = 'unbind';
    }

    var groupFirstFrame = model.getFirstFrame();
    groupFirstFrame[action]('change', this.render, this);
    groupFirstFrame.get('conversation') && groupFirstFrame.get('conversation')[action]('change', this.render, this);
    model.get('frames')[action]('change', this.render, this);
    model.get('frames')[action]('add', this.render, this);
    model.get('frames')[action]('destroy', this.render, this);
    model[action]('change', this.render, this);
    shelby.models.queuedVideos[action]('add:queued_videos', this._onQueuedVideosAdd, this);
    shelby.models.queuedVideos[action]('remove:queued_videos', this._onQueuedVideosRemove, this);
  },

  render : function(){
    var self = this;
    this._leaveChildren();
    
    if (this.model.get('frames').length){
      var useFrameCreatorInfo = this.model.getFirstFrame().conversationUsesCreatorInfo(shelby.models.user);
      this.$el.html(this.template({ queuedVideosModel : shelby.models.queuedVideos, frameGroup : this.model, frame : this.model.getFirstFrame(), options : this.options }));

      libs.shelbyGT.ActiveHighlightListItemView.prototype.render.call(this);
    }
  },

  _expand: function(){
    if (this.model.get('collapsed')) {
      this.model.unset('collapsed');
      this.render();
    }
  },

  _activate : function(){
    if (this.model.get('collapsed')) {
      this._expand();
      return;
    }
    shelby.models.guide.set('activeFrameModel', this.model.getFirstFrame());
  },

  // override ActiveHighlightListItemView abstract method
  doActivateThisItem : function(guideModel){
    var activeFrameModel = guideModel.get('activeFrameModel');
    if (activeFrameModel && activeFrameModel.id == this.model.getFirstFrame().id) {
      this._expand();
      return true;
    } else {
      return false;
    }
  },
  
  requestFrameShareView: function(){
    this.options.guideOverlayModel.switchOrHideOverlay(libs.shelbyGT.GuideOverlayType.share,
      this.model.getFirstFrame());
  },
  
  requestFrameRollView : function(){
    this.options.guideOverlayModel.switchOrHideOverlay(libs.shelbyGT.GuideOverlayType.rolling,
      this.model.getFirstFrame());
  },

  _onClickQueue : function(){
    self = this;
    this.model.getFirstFrame().saveToWatchLater();
    // immediately change the button state
    this.$('.js-queue-frame').addClass('queued');
    this.$('.js-queue-frame button').text('Queued');
    // immediately add the saved-indicator to the frame thumbnail
    self.$('.video-thumbnail').append(JST['saved-indicator']());
    // start the transition which fades out the saved-indicator
    var startTransition = _.bind(function() {
      this.$('.video-saved').addClass('video-saved-trans');
    }, self);
    setTimeout(startTransition, 0);
  },

  _removeFrame : function(){
    this.leave();
    // if user is trying to delete the currently playing frame, kick on to the next one
    // then delete
    if (shelby.models.guide.get('activeFrameModel')===this.model.getFirstFrame()){
      Backbone.Events.trigger('playback:next');
    }
    var self = this;
    setTimeout(function(){
      self.model.get('frames').forEach(function(frame){
        frame.destroy({wait:true});
      });
    }, 100);
  },

  _upvote : function(){
    var self = this;
    // check if they're already an upvoter
    if ( !_.contains(this.model.getFirstFrame().get('upvoters'), shelby.models.user.id) ) {
      this.model.getFirstFrame().upvote(function(f){
        var upvoteUsers = self.model.getFirstFrame().get('upvote_users');
        upvoteUsers.push(shelby.models.user.toJSON());
        self.model.getFirstFrame().set({upvoters: f.get('upvoters'), upvote_users: upvoteUsers });
      });
    }
  },
  
  _requestConversationView : function(){
    this.options.guideOverlayModel.switchOrHideOverlay(libs.shelbyGT.GuideOverlayType.conversation,
      this.model.getFirstFrame());
  },

  _goToCreatorsPersonalRoll : function(){
    if (this.model.get('collapsed')) {
      this._expand();
      return;
    }
    
    if (libs.shelbyGT.viewHelpers.roll.isFaux(this.model.getFirstFrame().get('roll'))){
      //not showing personal rolls for faux users
      return;
    }

    var creator = this.model.getFirstFrame().get('creator');

    if (creator) {
      shelby.router.navigate('user/' + creator.id + '/personal_roll', {trigger:true});
    }

  },

  _goToSourceRoll : function(){
    if (this.model.get('collapsed')) {
      this._expand();
      return;
    }
    
    if (libs.shelbyGT.viewHelpers.roll.isFaux(this.model.getFirstFrame().get('roll'))){
      //not showing personal rolls for faux users
      return;
    }
    
    if (this.model.getFirstFrame().isOnRoll(shelby.models.user.get('heart_roll_id')) ||
        this.model.getFirstFrame().isOnRoll(shelby.models.user.get('watch_later_roll_id'))) {
      // if the frame is on the heart or queue roll we actually want to go to the roll
      // that this frame was hearted or queued FROM
      var ancestorId = _(this.model.getFirstFrame().get('frame_ancestors')).last();
      shelby.router.navigate('rollFromFrame/' + ancestorId, {trigger:true});
    } else {
      shelby.router.navigateToRoll(this.model.getFirstFrame().get('roll'), {trigger:true});
    }
  },
  
  _goToRollById : function(e){
    shelby.router.navigate('roll/' + $(e.currentTarget).data('public_roll_id'), {trigger:true});
    return false;
  },

  _goToFrameAndRollById : function(e){
    shelby.router.navigate('roll/' + $(e.currentTarget).data('roll_id') + '/frame/' + $(e.currentTarget).data('frame_id'), {trigger:true});
    return false;
  }

});
