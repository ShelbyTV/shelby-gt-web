libs.shelbyGT.CommentOverlayMessageView = Support.CompositeView.extend({

  _conversationDisplayed : false,

  events : {
    "click .js-user-personal-roll" : "_goToUserPersonalRoll"
  },

  tagName : 'blockquote',

  className : 'user video-author',

  template : function(obj){
    return JST['comment-overlay-message'](obj);
  },

  render : function(showConversation){
    this.$el.html(this.template({message:this.model,frame:this.options.frame}));
  },

  _goToUserPersonalRoll : function(e){
    e.preventDefault();
    var userId = $(e.currentTarget).attr('data-user-id');
    shelby.router.navigate('user/' + userId + '/personal_roll', {trigger:true});
  }

});