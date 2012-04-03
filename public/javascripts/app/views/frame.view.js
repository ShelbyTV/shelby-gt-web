libs.shelbyGT.FrameView = ListItemView.extend({

  _conversationDisplayed : false,

  events : {
    "click .js-frame-activate"          : "_activate",
    "click .roll"                       : "_goToRoll",
    "click .save-frame"                 : "_saveToWatchLater",
    "click .remove-frame"               : "_removeFromWatchLater",
    "click .js-video-activity-toggle"   : "_toggleConversationDisplay",
    "click .video-source"   						: "_goToRoll",
		"click .video-score"								: "_upvote",
    "transitionend .video-saved"        : "_onSavedTransitionComplete",
    "webkitTransitionEnd .video-saved"  : "_onSavedTransitionComplete",
    "MSTransitionEnd .video-saved"      : "_onSavedTransitionComplete",
    "oTransitionEnd .video-saved"       : "_onSavedTransitionComplete"
  },

  tagName : 'li',

  className : 'frame',

  template : function(obj){
    return JST['frame'](obj);
  },

  initialize : function() {
    this.model.bind('destroy', this._onFrameRemove, this);
    ListItemView.prototype.initialize.call(this);
  },

  _cleanup : function(){
    this.model.unbind('destroy', this._onFrameRemove, this);
    ListItemView.prototype._cleanup.call(this);
  },

  render : function(){
    this.$el.html(this.template({frame : this.model}));
  },

  _activate : function(){
    shelby.models.guide.set('activeFrameModel', this.model);
  },

  _goToRoll : function(){
    shelby.router.navigateToRoll(this.model.get('roll'), {trigger:true});
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
    this.model.destroy();
  },

	_upvote : function(){
		var self = this;
		// check if they're already an upvoter
		if ( !_.contains(this.model.get('upvoters'), shelby.models.user.id) ) {
			this.model.upvote(function(r){
				var upvoters = r.get('upvoters');
				// a little, possibly unnecessary, animation
				self.$('.video-score').animate({'margin-top': '-=21'}, 100, function(){
					$(this).css('margin-top','0px');
				}).text(upvoters.length);
				// set the returned upvoter attr to prevent user from being able to upvote again.
				self.model.set('upvoters', upvoters);
			});						
		}
	},

  _toggleConversationDisplay : function(){
    this._conversationDisplayed = !this._conversationDisplayed;
    this.$('.js-video-activity').slideToggle(200);
    this.$('.js-video-activity-toggle-verb').text(this._conversationDisplayed ? 'Hide' : 'See');
  },

  _onSavedTransitionComplete : function(){
    // when the saved indicator has completely faded out, remove it from the DOM
    this.$('.video-saved').remove();
  },

  _onFrameRemove : function() {
    // TODO: perform some visually attractive removal animation for the frame
  }

});
