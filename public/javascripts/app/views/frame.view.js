libs.shelbyGT.FrameView = ListItemView.extend({

  _conversationDisplayed : false,

  events : {
    "click .js-frame-activate"  : "_activate",
    "click .roll"               : "_goToRoll",
    "click .js-video-activity-toggle" : "_toggleConversationDisplay"
  },

  tagName : 'li',

  className : 'frame',

  template : function(obj){
    return JST['frame'](obj);
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

  _toggleConversationDisplay : function(){
    this._conversationDisplayed = !this._conversationDisplayed;
    this.$('.js-video-activity').slideToggle(200);
    this.$('.js-video-activity-toggle-verb').text(this._conversationDisplayed ? 'Hide' : 'See');
  },

});
