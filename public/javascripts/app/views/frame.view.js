libs.shelbyGT.FrameView = libs.shelbyGT.ActiveHighlightListItemView.extend({

  _conversationDisplayed : false,

  _grewForFrameRolling : false,

  _frameRollingView : null,

  _frameViewState: null,

  options : _.extend({}, libs.shelbyGT.ActiveHighlightListItemView.prototype.options, {
      activationStateProperty : 'activeFrameModel'
  }),

  events : {
    "click .js-frame-activate"              : "_activate",
    "click .js-roll-frame"                  : "RequestFrameRollingView",
    "click .js-save-frame"                  : "_saveToWatchLater",
    "click .js-remove-frame"                : "_removeFromWatchLater",
    "click .js-share-frame"                 : "_shareFrame",
    "click .js-video-activity-toggle"       : "_toggleConversationDisplay",
    "click .js-creator-personal-roll"       : "_goToCreatorPersonalRoll",
    "click .js-frame-source"                : "_goToSourceRoll",
    "click .js-upvote-frame"                : "_upvote",
    "click .js-go-to-roll-by-id"            : "_goToRollById",
    "transitionend .video-saved"            : "_onSavedTransitionComplete",
    "webkitTransitionEnd .video-saved"      : "_onSavedTransitionComplete",
    "MSTransitionEnd .video-saved"          : "_onSavedTransitionComplete",
    "oTransitionEnd .video-saved"           : "_onSavedTransitionComplete",
    "transitionend .js-rolling-frame"       : "_onFrameRollingTransitionComplete",
    "webkitTransitionEnd .js-rolling-frame" : "_onFrameRollingTransitionComplete",
    "MSTransitionEnd .js-rolling-frame"     : "_onFrameRollingTransitionComplete",
    "oTransitionEnd .js-rolling-frame"      : "_onFrameRollingTransitionComplete",
    "click .js-message-submit"              : "_addMessage"
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
    this.model.get('conversation').on('change', this._onConversationChange, this);
    this._frameViewState = new libs.shelbyGT.FrameViewStateModel();
    this._frameViewState.bind('change:doFrameAction', this._onDoFrameActionChange, this);
    libs.shelbyGT.ActiveHighlightListItemView.prototype.initialize.call(this);
  },

  _cleanup : function(){
    this.model.unbind('destroy', this._onFrameRemove, this);
    this.model.unbind('change:upvoters', this._onUpvoteChange, this);
    this.model.get('conversation').off('change', this._onConversationChange, this);
    this._frameViewState.unbind('change:doFrameAction', this._onDoFrameActionChange, this);
    libs.shelbyGT.ActiveHighlightListItemView.prototype._cleanup.call(this);
  },

  render : function(showConversation){
    var self = this;
    this._leaveChildren();

    var useFrameCreatorInfo = this.model.conversationUsesCreatorInfo(shelby.models.user);
    this.$el.html(this.template({
      frame : this.model,
      showConversation : showConversation
    }));

    // if the first message is not from the frame's creator and we're not on the watch later roll,
    // use equivalent info about the frame's creator as a simulated first message
    // otherwise, just render the first message
    var firstMessageViewParams = useFrameCreatorInfo ? {frame:this.model} : {model:this.model.get('conversation').get('messages').first()};

//  COMMENTING THIS OUT OBVIOUSLY DOESN'T SOLVE ANYTHING
//  DOING THIS FOR TESTING PURPOSES
//    var firstMessageView = new libs.shelbyGT.MessageView(firstMessageViewParams);
//    this.insertChildBefore(firstMessageView,'.js-video-activity');

    // render all other messages that haven't already been rendered
    // var startIndex = useFrameCreatorInfo ? 0 : 1;
    // var _messages = _(this.model.get('conversation').get('messages');
    this.model.get('conversation').get('messages').each(function(message){
      var messageView = new libs.shelbyGT.MessageView({model:message});
      self.renderChild(messageView);
      self.$('.video-activity-list').append($('<li>').append(messageView.el));
    });

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

  RequestFrameRollingView : function(share){
    if (share === true) {
      this._frameViewState.set('doFrameAction', 'share');
    }
    else {
      this._frameViewState.set('doFrameAction', 'roll');
    }
  },

  _roll : function(socialShare){
    if (!this._frameRollingView) {
      this._frameRollingView = new libs.shelbyGT.FrameRollingView({model:this.model});
      this.appendChildInto(this._frameRollingView, 'article');
      // dont reveal the frame rolling view until the rolls that can be posted to have been fetched
      // via ajax
      var self = this;
      shelby.models.guide.set('activeFrameRollingView', self._frameRollingView);
      self.$('.js-rolling-frame').addClass('rolling-frame-trans');
    }
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

  _toggleConversationDisplay : function(){
    this._conversationDisplayed = !this._conversationDisplayed;
    this.$('.js-video-activity').slideToggle(200);
    // this.$('.js-video-activity-toggle-comment').text(this._conversationDisplayed ? ' frame-comments-eopn' : '');
    this.$('.js-video-activity-toggle-comment').toggleClass('frame-comments-open');
  },

  _onConversationChange : function(){
    this.render(true);
  },

  _isMessageValid : function(msg){
    return msg.length;
  },

  _renderError : function(msg){
    this.$('.js-add-message-input').addClass('error');
    return false;
  },

  _onAddMessageInputChange : function(event){
    if (event.keyCode==13){
      return this._addMessage();
    }
  },

  _onAddMessageInputFocus : function(event){
    this.$('.js-add-message-input').removeClass('error');
  },

  _addMessage : function(){
    var self = this;
    var text = this.$('.js-add-message-input').val();

    if (!this._isMessageValid(text)) {
      this._renderError('Why not say something?');
      return false;
    }
    var msg = new libs.shelbyGT.MessageModel({text:text, conversation_id:this.model.get('conversation').id});
    msg.save(null, {
      success:function(conversation){
        if (!self._conversationDisplayed){
          self._toggleConversationDisplay();
        }
        self.model.set('conversation', conversation);
      },
      error:function(){
        console.log('err', arguments);
      }
    });
    return false;
  },

  _goToCreatorPersonalRoll : function(){
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

  _onSavedTransitionComplete : function(){
    // when the saved indicator has completely faded out, remove it from the DOM
    this.$('.video-saved').remove();
  },

  _onFrameRollingTransitionComplete : function(e){
    var self = this;
    if ($(e.currentTarget).hasClass('rolling-frame-trans')) {
      // frame rolling view just rolled in
      // grow the view if it's too small to show the internal share view
      var minHeight = shelby.config.animation.frameGrow.minHeight;
      var distance = minHeight - this.$('article').height();
      if (distance > 0) {
        var $user = this.$('.js-frame-flexible-height');
        var targetHeight = $user.height() + distance;
        $user.animate({height:targetHeight + 'px'}, 200);
        this._grewForFrameRolling = true;
      }
    } else {
      // frame rolling view just rolled out, remove it and shrink back to frame's original height
      this._frameViewState.set('doFrameAction', null);
			
      if (this._grewForFrameRolling) {
        this.$('.js-frame-flexible-height').animateAuto('height', 200);
        this._grewForFrameRolling = false;
      }
    }
  },

  _onFrameRemove : function() {
    // TODO: perform some visually attractive removal animation for the frame
  },

  _onDoFrameActionChange : function(frameStateModel, doFrameAction) {
    if (doFrameAction == "roll") {
      // hard core rolling action
      this._roll();
    } else if (doFrameAction == "share"){
			// only perform a social share
      this._roll(true);
		}
    else {
      this._frameRollingView.leave();
      this._frameRollingView = null;
    }
  },

  _shareFrame : function(){
    this.RequestFrameRollingView(true);
    var personalRoll = shelby.models.rollFollowings.getRollModelById(shelby.models.user.get('personal_roll').id);
    this._frameRollingView.revealFrameRollingCompletionView(this.model, personalRoll, {social:true, sharing:true});
  }

});
