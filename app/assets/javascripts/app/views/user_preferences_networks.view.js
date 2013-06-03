libs.shelbyGT.UserPreferencesNetworksView = Support.CompositeView.extend({

  tagName: 'div',

  className: 'content_lining preferences_page preferences_page--networks',

  options : _.extend({}, Support.CompositeView.prototype.options, {}),

  template : function(obj){
      return SHELBYJST['preferences-networks'](obj);
  },

  render : function(){
    var data = {};

    this.$el.html(this.template(data));
  },

  initialize : function(){
    console.log('/preferences/networks!');
  },

  _cleanup : function(){
  }

});