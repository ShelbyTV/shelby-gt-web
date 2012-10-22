libs.shelbyGT.InviteFormView = Support.CompositeBehaviorView.extend({

  events: {
    "click .js-send-invite" : "_sendInvite"
  },

  template : function(obj){
      return SHELBYJST['invite-form'](obj);
  },

  render : function(){
    this.$el.html(this.template({
      invite : this.model,
      user : this.options.user
    }));
  },

  _sendInvite : function(){

    var self = this;

    this.model.save({
      to : this.$('.js-invite-email').text(),
      body : this.$('.js-invite-message').text()
    },{
      success : function(){
        self.$el.hide();
        self.$('.js-invite-email').text("");
      }
    });
  }

});
