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
    "click .js-save-frame"                  : "_saveToWatchLater",
    "click .js-remove-frame"                : "_removeFrame",
    "click .js-video-activity-toggle"       : "_requestConversationView",
    "click .js-upvote-frame"                : "_upvote",
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
    this.model.get('frames').at(0).bind('destroy', this._onFrameRemove, this);
    this.model.get('frames').at(0).bind('change', this.render, this);
    this.model.get('frames').at(0).get('conversation') && this.model.get('frames').at(0).get('conversation').bind('change', this.render, this);
    this.model.get('frames').bind('change', this.render, this);
    this.model.get('frames').bind('add', this.render, this);
    this.model.get('frames').bind('destroy', this.render, this);
    this.model.bind('change', this.render, this);
    libs.shelbyGT.ActiveHighlightListItemView.prototype.initialize.call(this);
  },

  _cleanup : function(){
    this.model.get('frames').at(0).unbind('destroy', this._onFrameRemove, this);
    this.model.get('frames').at(0).unbind('change', this.render, this);
    this.model.get('frames').at(0).get('conversation') && this.model.get('frames').at(0).get('conversation').unbind('change', this.render, this);
    this.model.get('frames').unbind('change', this.render, this);
    this.model.get('frames').unbind('add', this.render, this);
    this.model.get('frames').unbind('destroy', this.render, this);
    this.model.unbind('change', this.render, this);
    libs.shelbyGT.ActiveHighlightListItemView.prototype._cleanup.call(this);
  },

  render : function(){
    var self = this;
    this._leaveChildren();

    var useFrameCreatorInfo = this.model.get('frames').at(0).conversationUsesCreatorInfo(shelby.models.user);
    this.$el.html(this.template({ frameGroup : this.model, frame : this.model.get('frames').at(0), options : this.options }));

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
    // if (this._frameSharingInGuideView) {
    //   if (this._frameSharingInGuideView == shelby.models.guide.get('activeGuideOverlayView')) {
    //     this._frameSharingInGuideView.hide();
    //     return;
    //   }
    // } else {
    //   var personalRoll = shelby.models.rollFollowings.getRollModelById(shelby.models.user.get('personal_roll').id);
      
    //   this._frameSharingInGuideView = new libs.shelbyGT.FrameSharingInGuideView({model:this.model.get('frames').at(0), roll:personalRoll});
    //   this._frameSharingInGuideView.render();
    // }

    // this._hideInGuideView();
    // this._frameSharingInGuideView.insertIntoDom(false);
    // this._frameSharingInGuideView.reveal();
    // shelby.models.guide.set('activeGuideOverlayView', this._frameSharingInGuideView);
  },
  
  requestFrameRollView : function(){
    this._checkSetGuideOverlayState(libs.shelbyGT.GuideOverlayType.rolling);
    // if (this._frameRollingView) {
    //   if (this._frameRollingView == shelby.models.guide.get('activeGuideOverlayView')) {
    //     this._frameRollingView.hide();
    //     return;
    //   }
    // } else {
    //   this._frameRollingView = new libs.shelbyGT.FrameRollingView({model:this.model.get('frames').at(0)});
    //   this._frameRollingView.render();
    // }

    // this._hideInGuideView();
    // this._frameRollingView.insertIntoDom(false);
    // this._frameRollingView.reveal();
    // shelby.models.guide.set('activeGuideOverlayView', this._frameRollingView);
  },

  _hideInGuideView : function(){
    var view = shelby.models.guide.get('activeGuideOverlayView');

    view && view.hide();

  },

  _saveToWatchLater : function(){
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
    // if (this._conversationView) {
    //   if (this._conversationView == shelby.models.guide.get('activeGuideOverlayView')) {
    //     this._conversationView.hide();
    //     return;
    //   }
    // } else {
    //   this._conversationView = new libs.shelbyGT.FrameConversationView({model:this.model.get('frames').at(0)});
    //   this._conversationView.render();
    // }

    // this._hideInGuideView();
    // this._conversationView.insertIntoDom(false);
    // this._conversationView.reveal();
    // shelby.models.guide.set('activeGuideOverlayView', this._conversationView);
  },

  _checkSetGuideOverlayState : function(type) {
    //if we're already showing the specified overlay type for this frame, hide it
    var alreadyShowingThisOverlay =
        this.options.guideOverlayModel.get('activeGuideOverlayType') == type &&
        this.options.guideOverlayModel.has('activeGuideOverlayFrame') &&
        this.options.guideOverlayModel.get('activeGuideOverlayFrame').id == this.model.get('frames').at(0).id;

    if (type == libs.shelbyGT.GuideOverlayType.none || alreadyShowingThisOverlay) {
      // hide the current overlay
      this.options.guideOverlayModel.set({
        'activeGuideOverlayFrame' : null,
        'activeGuideOverlayType' : libs.shelbyGT.GuideOverlayType.none
      });
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
