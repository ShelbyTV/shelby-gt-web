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
    var recipientsAutocompleteView = new libs.shelbyGT.EmailAddressAutocompleteView({
      el : this.$('.js-invite-email')[0],
      includeSources : ['email']
    });
    this.renderChild(recipientsAutocompleteView);
  },

  _sendInvite : function(){

    var self = this;

    this.model.save({
      to : this.$('.js-invite-email').val(),
      body : this.$('.js-invite-message').val()
    },{
      success : function(){
        self.$el.hide();
        self.$('.js-invite-email').val("");
      }
    });
  }

});
