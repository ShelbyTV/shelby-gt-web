libs.shelbyGT.FrameView = ListItemView.extend({

  _conversationDisplayed : false,

  events : {
    "click .js-frame-activate"          : "_activate",
    "click .roll"                       : "_goToRoll",
    "click .save-frame"                 : "_saveToWatchLater",
    "click .remove-frame"               : "_removeFromWatchLater",
    "click .js-video-activity-toggle"   : "_toggleConversationDisplay"
  },

  tagName : 'li',

  className : 'frame',

  template : function(obj){
    return JST['frame'](obj);
  },

  initialize : function() {
    this.model.bind('destroy', this._onFrameSync, this);
    ListItemView.prototype.initialize.call(this);
  },

  _cleanup : function(){
    this.model.unbind('destroy', this._onFrameSync, this);
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
    this.model.saveToWatchLater(function(){
      self.$('.video-thumbnail').append(JST['saved-indicator']());
    });
  },

  _removeFromWatchLater : function(){
    this.model.destroy();
  },

  _onFrameSync : function() {
    console.log('destroy', arguments);
  },

  _toggleConversationDisplay : function(){
    this._conversationDisplayed = !this._conversationDisplayed;
    this.$('.js-video-activity').slideToggle(200);
    this.$('.js-video-activity-toggle-verb').text(this._conversationDisplayed ? 'Hide' : 'See');
  }

});
