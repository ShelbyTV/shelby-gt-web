libs.shelbyGT.UserPreferencesGoodiesView = Support.CompositeView.extend({

  tagName: 'div',

  className: 'content_lining preferences_page preferences_page--goodies',

  options : _.extend({}, Support.CompositeView.prototype.options, {}),

  template : function(obj){
      return SHELBYJST['preferences-goodies'](obj);
  },

  render : function(){
    var data = {};

    this.$el.html(this.template(data));
  },

  initialize : function(){
    console.log('/preferences/goodies!');
  },

  _cleanup : function(){
  }

});