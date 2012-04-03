libs.shelbyGT.FrameView = ListItemView.extend({

  _conversationDisplayed : false,

  events : {
    "click .js-frame-activate"          : "_activate",
    "click .roll-frame"                 : "_roll",
    "click .save-frame"                 : "_saveToWatchLater",
    "click .remove-frame"               : "_removeFromWatchLater",
    "click .js-video-activity-toggle"   : "_toggleConversationDisplay",
    "click .video-source"               : "_goToRoll",
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

  _roll : function(){
    console.log('rolling');
    this.appendChild(new libs.shelbyGT.RollingSelectionListView({model:shelby.models.user,frame:this.model}));
    shelby.models.user.fetch({data:{include_rolls:true}});
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

  _toggleConversationDisplay : function(){
    this._conversationDisplayed = !this._conversationDisplayed;
    this.$('.js-video-activity').slideToggle(200);
    this.$('.js-video-activity-toggle-verb').text(this._conversationDisplayed ? 'Hide' : 'See');
  },

  _goToRoll : function(){
    shelby.router.navigateToRoll(this.model.get('roll'), {trigger:true});
  },

  _onSavedTransitionComplete : function(){
    // when the saved indicator has completely faded out, remove it from the DOM
    this.$('.video-saved').remove();
  },

  _onFrameRemove : function() {
    // TODO: perform some visually attractive removal animation for the frame
  }

});
