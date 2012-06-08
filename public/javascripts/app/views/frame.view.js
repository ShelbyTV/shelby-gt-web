libs.shelbyGT.FrameView = libs.shelbyGT.ActiveHighlightListItemView.extend({

  _conversationDisplayed : false,

  _grewForFrameRolling : false,

  _frameRollingView : null,
  
  _conversationView : null,

  options : _.extend({}, libs.shelbyGT.ActiveHighlightListItemView.prototype.options, {
      activationStateProperty : 'activeFrameModel'
  }),

  events : {
    "click .js-frame-activate"              : "_activate",
    "click .js-roll-frame"                  : "requestFrameRollView",
    "click .js-share-frame"                 : "requestFrameShareView",
    "click .js-save-frame"                  : "_saveToWatchLater",
    "click .js-remove-frame"                : "_removeFromWatchLater",
    "click .js-video-activity-toggle"       : "_requestConversationView",
    "click .js-frame-source"                : "_goToRoll",
    "click .js-upvote-frame"                : "_upvote",
    "click .js-go-to-roll-by-id"            : "_goToRollById"
  },

  tagName : 'li',

  className : 'frame',

  template : function(obj){
    var _tmplt;
    if (shelby.commentUpvoteUITest){
     _tmplt = JST['ui-tests/frame-upvote-comment-test'](obj);
    } else { 
      try {
        _tmplt = JST['frame'](obj); 
      } catch(e){
        console.log(e.message, e.stack);
      }
    }
    return _tmplt;
  },

  initialize : function() {
    this.model.bind('destroy', this._onFrameRemove, this);
    this.model.bind('change:upvoters', this._onUpvoteChange, this);
    libs.shelbyGT.ActiveHighlightListItemView.prototype.initialize.call(this);
  },

  _cleanup : function(){
    this.model.unbind('destroy', this._onFrameRemove, this);
    this.model.unbind('change:upvoters', this._onUpvoteChange, this);
    libs.shelbyGT.ActiveHighlightListItemView.prototype._cleanup.call(this);
  },

  render : function(){
    var self = this;
    this._leaveChildren();

    var useFrameCreatorInfo = this.model.conversationUsesCreatorInfo(shelby.models.user);
    this.$el.html(this.template({ frame : this.model }));

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
    if (!this._frameSharingInGuideView) {
      var personalRoll = shelby.models.rollFollowings.getRollModelById(shelby.models.user.get('personal_roll').id);
      
      this._frameSharingInGuideView = new libs.shelbyGT.FrameSharingInGuideView({model:this.model, roll:personalRoll});
      this._frameSharingInGuideView.render();
    }
    this._frameSharingInGuideView.reveal();
  },
  
  requestFrameRollView : function(){
    if (!this._frameRollingView) {
      this._frameRollingView = new libs.shelbyGT.FrameRollingView({model:this.model});
      this._frameRollingView.render();
    }
    this._frameRollingView.reveal();
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

  _removeFromWatchLater : function(){
    // For UI Test workaround:
    if (shelby.commentUpvoteUITest){ this._upvote(); }
    else { this.model.destroy(); }
  },

  _upvote : function(){
    var self = this;
    // check if they're already an upvoter
    if ( !_.contains(this.model.get('upvoters'), shelby.models.user.id) ) {
      this.model.upvote(function(r){
        var upvoters = r.get('upvoters');
        // set the returned upvoter attr to prevent user from being able to upvote again.
        self.model.set('upvoters', upvoters);
      });
    }
  },

  _onUpvoteChange : function(){
    // For UI Test workaround:
    if (shelby.commentUpvoteUITest){
      this.$('.upvote-test').addClass('video-score-upvoted');
      this.$('.upvote-test').text(this.model.get('upvoters').length);
    }
    else {
      this.$('.js-upvote-frame').addClass('upvoted');
      this.$('.js-upvote-frame-lining').text(this.model.get('upvoters').length);
    }
  },
  
  _requestConversationView : function(){
    if(!this._conversationView){
      this._conversationView = new libs.shelbyGT.FrameConversationView({model:this.model});
      this._conversationView.render();
    }
    this._conversationView.reveal();
  },

  _goToRoll : function(){
    if (!this.model.isOnRoll(shelby.models.user.get('watch_later_roll'))) {
      shelby.router.navigateToRoll(this.model.get('roll'), {trigger:true});
    } else {
      // if the frame is on the watch later roll we actually want to go the roll
      // that this frame was saved FROM
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
