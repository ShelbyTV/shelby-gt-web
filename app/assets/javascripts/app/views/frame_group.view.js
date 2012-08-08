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
    "click .js-upvote-frame"                : "_onClickQueue",
    "click .js-go-to-roll-by-id"            : "_goToRollById",
    "click .js-go-to-frame-and-roll-by-id"  : "_goToFrameAndRollById"

  },

  tagName : 'li',

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
    shelby.models.queuedVideos.get('queued_videos').bind('add', this._onQueuedVideosAdd, this);
  },

  _cleanup : function(){
    this._setupTeardownModelBindings(this.model, false);
    libs.shelbyGT.ActiveHighlightListItemView.prototype._cleanup.call(this);
    shelby.models.queuedVideos.get('queued_videos').unbind('add', this._onQueuedVideosAdd, this);
  },

  _onQueuedVideosAdd : function(video){
    if (!this.model) return false;
    // we wanna make sure that this frames vid is the one being added
    if (this.model.get('frames').at(0).get('video').id !== video.id) return false;
    this._saveToWatchLater();
    this._toggleQueueButton(true);
  },

  _toggleQueueButton : function(add){
    var fn = add ? 'addClass' : 'removeClass'; 
    this.$('.js-upvote-frame')[fn]('upvoted'); 
  },

  _setupTeardownModelBindings : function(model, bind) {
    var action;
    if (bind) {
      action = 'bind';
    } else {
      action = 'unbind';
    }

    model.get('frames').at(0)[action]('destroy', this._onFrameRemove, this);
    model.get('frames').at(0)[action]('change', this.render, this);
    model.get('frames').at(0).get('conversation') && model.get('frames').at(0).get('conversation')[action]('change', this.render, this);
    model.get('frames')[action]('change', this.render, this);
    model.get('frames')[action]('add', this.render, this);
    model.get('frames')[action]('destroy', this.render, this);
    model[action]('change', this.render, this);
  },

  render : function(){
    var self = this;
    this._leaveChildren();

    var useFrameCreatorInfo = this.model.get('frames').at(0).conversationUsesCreatorInfo(shelby.models.user);
    this.$el.html(this.template({ queuedVideosModel : shelby.models.queuedVideos, frameGroup : this.model, frame : this.model.get('frames').at(0), options : this.options }));

    libs.shelbyGT.ActiveHighlightListItemView.prototype.render.call(this);
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
    shelby.models.guide.set('activeFrameModel', this.model.get('frames').at(0));
  },

  // override ActiveHighlightListItemView abstract method
  doActivateThisItem : function(guideModel){
    var activeFrameModel = guideModel.get('activeFrameModel');
    if (activeFrameModel && activeFrameModel.id == this.model.get('frames').at(0).id) {
      this._expand();
      return true;
    } else {
      return false;
    }
  },
  
  requestFrameShareView: function(){
    this._checkSetGuideOverlayState(libs.shelbyGT.GuideOverlayType.share);
  },
  
  requestFrameRollView : function(){
    this._checkSetGuideOverlayState(libs.shelbyGT.GuideOverlayType.rolling);
  },

  _onClickQueue : function(){
    shelby.models.queuedVideos.get('queued_videos').add(this.model.get('frames').at(0).get('video'));
  },

  _saveToWatchLater : function(){
    console.log('SAVING THIS BITCH');
    var self = this;
    // save to watch later, passing a callback that will add the saved-indicator
    // to the frame thumbnail when the save returns succsessfully
    this.model.get('frames').at(0).saveToWatchLater(function(){
      self.$('.video-thumbnail').append(JST['saved-indicator']());
      // start the transition which fades out the saved-indicator
      var startTransition = _.bind(function() {
        this.$('.video-saved').addClass('video-saved-trans');
      }, self);
      setTimeout(startTransition, 0);
    });
  },

  _removeFrame : function(){
    this.model.destroy();
  },

  _upvote : function(){
    var self = this;
    // check if they're already an upvoter
    if ( !_.contains(this.model.get('frames').at(0).get('upvoters'), shelby.models.user.id) ) {
      this.model.get('frames').at(0).upvote(function(f){
        var upvoteUsers = self.model.get('frames').at(0).get('upvote_users');
        upvoteUsers.push(shelby.models.user.toJSON());
        self.model.get('frames').at(0).set({upvoters: f.get('upvoters'), upvote_users: upvoteUsers });        
      });
    }
  },
  
  _requestConversationView : function(){
    this._checkSetGuideOverlayState(libs.shelbyGT.GuideOverlayType.conversation);
  },

  _checkSetGuideOverlayState : function(type) {
    //if we're already showing the specified overlay type for this frame, hide it
    var alreadyShowingThisOverlay =
        this.options.guideOverlayModel.get('activeGuideOverlayType') == type &&
        this.options.guideOverlayModel.has('activeGuideOverlayFrame') &&
        this.options.guideOverlayModel.get('activeGuideOverlayFrame').id == this.model.get('frames').at(0).id;

    if (type == libs.shelbyGT.GuideOverlayType.none || alreadyShowingThisOverlay) {
      // hide the current overlay(s)
      this.options.guideOverlayModel.clearAllGuideOverlays();
    } else {
      // show the requested overlay
      this.options.guideOverlayModel.set({
        'activeGuideOverlayFrame' : this.model.get('frames').at(0),
        'activeGuideOverlayType' : type
      });
    }
  },

  _goToCreatorsPersonalRoll : function(){
    if (this.model.get('collapsed')) {
      this._expand();
      return;
    }

    var creator = this.model.get('frames').at(0).get('creator');

    if (creator) {
      shelby.router.navigate('user/' + creator.id + '/personal_roll', {trigger:true});
    }

  },

  _goToSourceRoll : function(){
    if (this.model.get('collapsed')) {
      this._expand();
      return;
    }
    if (!this.model.get('frames').at(0).isOnRoll(shelby.models.user.get('heart_roll_id'))) {
      shelby.router.navigateToRoll(this.model.get('frames').at(0).get('roll'), {trigger:true});
    } else {
      // if the frame is on the heart roll we actually want to go the roll
      // that this frame was hearted FROM
      var ancestorId = _(this.model.get('frames').at(0).get('frame_ancestors')).last();
      shelby.router.navigate('rollFromFrame/' + ancestorId, {trigger:true});
    }
  },
  
  _goToRollById : function(e){
    shelby.router.navigate('roll/' + $(e.currentTarget).data('public_roll_id'), {trigger:true});
    return false;
  },

  _goToFrameAndRollById : function(e){
    shelby.router.navigate('roll/' + $(e.currentTarget).data('roll_id') + '/frame/' + $(e.currentTarget).data('frame_id'), {trigger:true});
    return false;
  },

  _onFrameRemove : function() {
    // TODO: perform some visually attractive removal animation for the frame
  }

});
