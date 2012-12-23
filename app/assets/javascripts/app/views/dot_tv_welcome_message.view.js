libs.shelbyGT.dotTVWelcome = Support.CompositeView.extend({

  events : {
    "click .js-start-playing"         : "_hideWelcomeMessage"
  },

  el : '#dot-tv-welcome-message',

  template : function(obj){
    console.log("dotTVWelcome");
    return SHELBYJST['dot-tv-welcome-message'](obj);
  },

  render : function(){
    this.$el.html(this.template({user:this.model}));
  },

  _hideWelcomeMessage : function(){
    this.$el.addClass('hidden');
  }

});