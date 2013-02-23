libs.shelbyGT.MessageView = Support.CompositeView.extend({

  events : {
    "click .js-user-personal-roll" : "_goToUserPersonalRoll"
  },

  tagName : 'li',

  className : 'conversation__item clearfix',

  template : function(obj){
    return SHELBYJST['message'](obj);
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
