libs.shelbyGT.FrameView = libs.shelbyGT.ActiveHighlightListItemView.extend({

  _conversationDisplayed : false,

  _grewForFrameRolling : false,

  _frameRollingView : null,
  
  _conversationView : null,

  _frameSharingInGuideView : null,
  
  options : _.extend({}, libs.shelbyGT.ActiveHighlightListItemView.prototype.options, {
      activationStateProperty : 'activeFrameModel',
      contextOverlay : false
  }),

  events : {
    "click .js-frame-activate"              : "_activate",
    "click .js-creator-personal-roll"       : "_goToCreatorsPersonalRoll",
    "click .js-frame-source"                : "_goToSourceRoll",
    "click .js-roll-frame"                  : "requestFrameRollView",
    "click .js-share-frame"                 : "requestFrameShareView",
    "click .js-save-frame"                  : "_saveToWatchLater",
    "click .js-remove-frame"                : "_removeFrame",
    "click .js-video-activity-toggle"       : "_requestConversationView",
    "click .js-upvote-frame"                : "_upvote",
    "click .js-go-to-roll-by-id"            : "_goToRollById"
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
    this.model.bind('destroy', this._onFrameRemove, this);
    this.model.bind('change', this.render, this);
    this.model.get('conversation') && this.model.get('conversation').bind('change', this.render, this);
    libs.shelbyGT.ActiveHighlightListItemView.prototype.initialize.call(this);
  },

  _cleanup : function(){
    this.model.unbind('destroy', this._onFrameRemove, this);
    this.model.unbind('change', this.render, this);
    this.model.get('conversation') && this.model.get('conversation').unbind('change', this.render, this);
    libs.shelbyGT.ActiveHighlightListItemView.prototype._cleanup.call(this);
  },

  render : function(){
    var self = this;
    this._leaveChildren();

    var useFrameCreatorInfo = this.model.conversationUsesCreatorInfo(shelby.models.user);
    this.$el.html(this.template({ frame : this.model, options : this.options }));

    libs.shelbyGT.ActiveHighlightListItemView.prototype.render.call(this);
  },

  _activate : function(){
    shelby.models.guide.set('activeFrameModel', this.model);
  },

  // override ActiveHighlightListItemView abstract method
  doActivateThisItem : function(guideModel){
    var activeFrameModel = guideModel.get('activeFrameModel');
    return activeFrameModel && activeFrameModel.id == this.model.id;
  },
  
  requestFrameShareView: function(){
    this._hideInGuideView();

    if (!this._frameSharingInGuideView) {
      var personalRoll = shelby.models.rollFollowings.getRollModelById(shelby.models.user.get('personal_roll').id);
      
      this._frameSharingInGuideView = new libs.shelbyGT.FrameSharingInGuideView({model:this.model, roll:personalRoll});
      this._frameSharingInGuideView.render();
    }
    this._frameSharingInGuideView.reveal();

    shelby.models.guide.set('activeGuideOverlayView', this._frameSharingInGuideView);

  },
  
  requestFrameRollView : function(){
    this._hideInGuideView();

    if (!this._frameRollingView) {
      this._frameRollingView = new libs.shelbyGT.FrameRollingView({model:this.model});
      this._frameRollingView.render();
    }
    this._frameRollingView.reveal();

    shelby.models.guide.set('activeGuideOverlayView', this._frameRollingView);
  },

  _hideInGuideView : function(){
    var view = shelby.models.guide.get('activeGuideOverlayView');

    view && view.cancel();

  },

  _saveToWatchLater : function(){
    var self = this;
    // save to watch later, passing a callback that will add the saved-indicator
    // to the frame thumbnail when the save returns succsessfully
    this.model.saveToWatchLater(function(){
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
    if ( !_.contains(this.model.get('upvoters'), shelby.models.user.id) ) {
      this.model.upvote(function(f){
        var upvoteUsers = self.model.get('upvote_users');
        upvoteUsers.push(shelby.models.user.toJSON());
        self.model.set({upvoters: f.get('upvoters'), upvote_users: upvoteUsers });
      });
    }
  },
  
  _requestConversationView : function(){
    this._hideInGuideView();

    if(!this._conversationView){
      this._conversationView = new libs.shelbyGT.FrameConversationView({model:this.model});
      this._conversationView.render();
    }
    this._conversationView.reveal();

    shelby.models.guide.set('activeGuideOverlayView', this._conversationView);
  },

  _goToCreatorsPersonalRoll : function(){
    var creator = this.model.get('creator');

    if (creator) {
      shelby.router.navigate('user/' + creator.id + '/personal_roll', {trigger:true});
    }

  },

  _goToSourceRoll : function(){
    if (!this.model.isOnRoll(shelby.models.user.get('heart_roll_id'))) {
      shelby.router.navigateToRoll(this.model.get('roll'), {trigger:true});
    } else {
      // if the frame is on the heart roll we actually want to go the roll
      // that this frame was hearted FROM
      var ancestorId = _(this.model.get('frame_ancestors')).last();
      shelby.router.navigate('rollFromFrame/' + ancestorId, {trigger:true});
    }
  },
  
  _goToRollById : function(e){
    shelby.router.navigate('roll/' + $(e.currentTarget).data('public_roll_id'), {trigger:true});
    return false;
  },

  _onFrameRemove : function() {
    // TODO: perform some visually attractive removal animation for the frame
  }

});
