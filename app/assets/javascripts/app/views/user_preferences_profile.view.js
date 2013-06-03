libs.shelbyGT.UserPreferencesProfileView = Support.CompositeView.extend({

  tagName: 'div',

  className: 'content_lining preferences_page preferences_page--profile',

  options : _.extend({}, Support.CompositeView.prototype.options, {}),

  template : function(obj){
      return SHELBYJST['preferences-profile'](obj);
  },

  render : function(){
    var data = {};

    this.$el.html(this.template(data));
  },

  initialize : function(){
    console.log('/preferences/profile!');
  },

  _cleanup : function(){
  }

});