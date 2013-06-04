libs.shelbyGT.UserPreferencesPasswordView = Support.CompositeView.extend({

  events : {
    "submit .js-preferences-password" : "_onSubmit"
  },

  className: 'content_lining preferences_page preferences_page--password',

  options : _.extend({}, Support.CompositeView.prototype.options, {}),

  template : function(obj){
      return SHELBYJST['preferences-password'](obj);
  },

  render : function(){
    var data = {};

    this.$el.html(this.template(data));
  },

  initialize : function(){
    console.log('/preferences/password!');
  },

  _cleanup : function(){
  },

  _onSubmit : function(e){
    e.preventDefault();


  }

});