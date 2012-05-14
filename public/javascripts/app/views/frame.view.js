libs.shelbyGT.FrameView = ListItemView.extend({

  _conversationDisplayed : false,

  _grewForFrameRolling : false,

  _frameRollingView : null,

  _frameViewState: null,

  events : {
    "click .js-frame-activate"              : "_activate",
    "click .roll-frame"                     : "RequestFrameRollingView",
    "click .save-frame"                     : "_saveToWatchLater",
    "click .remove-frame"                   : "_removeFromWatchLater",
    "click .js-video-activity-toggle"       : "_toggleConversationDisplay",
    "click .video-source"                   : "_goToRoll",
    "click .video-score"                    : "_upvote",
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
		}
		else { _tmplt = JST['frame'](obj); }
		return _tmplt;
  },

  initialize : function() {
    this.model.bind('destroy', this._onFrameRemove, this);
    this.model.bind('change:upvoters', this._onUpvoteChange, this);
    this.model.get('conversation').on('change', this._onConversationChange, this);
    this._frameViewState = new libs.shelbyGT.FrameViewStateModel();
    this._frameViewState.bind('change:doFrameRolling', this._onDoFrameRollingChange, this);
    ListItemView.prototype.initialize.call(this);
  },

  _cleanup : function(){
    this.model.unbind('destroy', this._onFrameRemove, this);
    this.model.unbind('change:upvoters', this._onUpvoteChange, this);
    this.model.get('conversation').off('change', this._onConversationChange, this);
    this._frameViewState.unbind('change:doFrameRolling', this._onDoFrameRollingChange, this);
    ListItemView.prototype._cleanup.call(this);
  },

  render : function(showConversation){
    var self = this;
    this._leaveChildren();

    var useFrameCreatorInfo = this.model.conversationUsesCreatorInfo(shelby.models.user);
    this.$el.html(this.template({
      frame : this.model,
      showConversation : showConversation,
      useFrameCreatorInfo : useFrameCreatorInfo
    }));
    if (this.model == shelby.models.guide.get('activeFrameModel')) {
      this.$el.addClass('active-frame');
    }

    // if the first message is not from the frame's creator and we're not on the watch later roll,
    // use equivalent info about the frame's creator as a simulated first message
    // otherwise, just render the first message
    var firstMessageViewParams = useFrameCreatorInfo ? {frame:this.model} : {model:this.model.get('conversation').get('messages').first()};
    var firstMessageView = new libs.shelbyGT.MessageView(firstMessageViewParams);
    this.insertChildBefore(firstMessageView,'.js-video-activity');

    // render all other messages that haven't already been rendered
    var startIndex = useFrameCreatorInfo ? 0 : 1;
    var _remainingMessages = _(this.model.get('conversation').get('messages').rest(startIndex));
    _remainingMessages.each(function(message){
      var messageView = new libs.shelbyGT.MessageView({model:message});
      self.renderChild(messageView);
      self.$('.video-activity-list').append($('<li>').append(messageView.el));
    });
  },

  _activate : function(){
    shelby.models.guide.set('activeFrameModel', this.model);
  },

  RequestFrameRollingView : function(){
    this._frameViewState.set('doFrameRolling', true);
  },

  _roll : function(){
    // the frame rolling view only needs to respond to an intial fetch of user roll followings,
    // not to subsequent updates of the user model, so we pass it a private clone of the user model
    // to bind to and fetch once
    if (!this._frameRollingView) {
      var privateUserModel = shelby.models.user.clone();
      this._frameRollingView = new libs.shelbyGT.FrameRollingView({model:this.model,user:privateUserModel});
      this.appendChildInto(this._frameRollingView, 'article');
      // dont reveal the frame rolling view until the rolls that can be posted to have been fetched
      // via ajax
      var self = this;
      privateUserModel.fetch({data:{include_rolls:true},success:function(){
        /*
         * the relevant list view needs to scroll to this._frameRollingView.el
         */
        shelby.models.guide.set('activeFrameRollingView', self._frameRollingView);
        self.$('.js-rolling-frame').addClass('rolling-frame-trans');
      }});
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
	    this.$('.video-score').addClass('video-score-upvoted');
	    this.$('.video-score').text(this.model.get('upvoters').length);			
		}
  },

  _toggleConversationDisplay : function(){
    this._conversationDisplayed = !this._conversationDisplayed;
    this.$('.js-video-activity').slideToggle(200);
    this.$('.js-video-activity-toggle-verb').text(this._conversationDisplayed ? 'Hide' : 'Show');
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
		};
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
        var $user = this.$('.user');
        var targetHeight = $user.height() + distance;
        $user.animate({height:targetHeight + 'px'}, 200);
        this._grewForFrameRolling = true;
      }
    } else {
      // frame rolling view just rolled out, remove it and shrink back to frame's original height
      this._frameViewState.set('doFrameRolling', false);
      if (this._grewForFrameRolling) {
        this.$('.user').animateAuto('height', 200);
        this._grewForFrameRolling = false;
      }
    }
  },

  _onFrameRemove : function() {
    // TODO: perform some visually attractive removal animation for the frame
  },

  _onDoFrameRollingChange : function(frameStateModel, doFrameRolling) {
    shelby.models.userProgress.set('framesRolled', shelby.models.userProgress.get('framesRolled') + (doFrameRolling ? 1 : -1));
    if (doFrameRolling) {
      this._roll();
    } else {
      this._frameRollingView.leave();
      this._frameRollingView = null;
    }
  }

});
