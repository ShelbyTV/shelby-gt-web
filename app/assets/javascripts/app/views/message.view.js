libs.shelbyGT.MessageView = Support.CompositeView.extend({

  _conversationDisplayed : false,

  events : {
    "click .js-user-personal-roll" : "_goToUserPersonalRoll"
  },

  tagName : 'li',

  className : 'conversation-message clearfix',

  template : function(obj){
    return JST['message'](obj);
  },

  render : function(showConversation){
    this.$el.html(this.template({message:this.model,frame:this.options.frame, user:shelby.models.user}));
  },

  _goToUserPersonalRoll : function(e){
    e.preventDefault();
    var userId = $(e.currentTarget).data('user-id');
    shelby.router.navigate('user/' + userId + '/personal_roll', {trigger:true});
    
    this.parent.hide();
  }

});
