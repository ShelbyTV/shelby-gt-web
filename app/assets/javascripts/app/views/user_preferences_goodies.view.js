libs.shelbyGT.UserPreferencesGoodiesView = Support.CompositeView.extend({

  tagName: 'div',

  className: 'content_lining',

  options : _.extend({}, Support.CompositeView.prototype.options, {}),

  template : function(obj){
      return SHELBYJST['preferences-goodies'](obj);
  },

  render : function(){
    this.$el.html(this.template());
  },

  initialize : function(){
    console.log('user password!');
  },

  _cleanup : function(){
  }


});