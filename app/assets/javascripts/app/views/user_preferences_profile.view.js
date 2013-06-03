libs.shelbyGT.UserPreferencesProfileView = Support.CompositeView.extend({

  tagName: 'div',

  className: 'content_lining preferences_page preferences_page--profile',

  options : _.extend({}, Support.CompositeView.prototype.options, {}),

  template : function(obj){
      return SHELBYJST['preferences-profile'](obj);
  },

  render : function(){
    console.log('opts',this);
    this.$el.html(this.template());
  },

  initialize : function(){
    console.log('/preferences/profile!');
  },

  _cleanup : function(){
  }

});