libs.shelbyGT.UserPreferencesProfileView = Support.CompositeView.extend({

  tagName: 'section',

  className: 'content_module external-tools',

  options : _.extend({}, Support.CompositeView.prototype.options, {
  }),

  template : function(obj){
      return SHELBYJST['preferences-profile'](obj);
  },

  render : function(){
    this.$el.html(this.template({opts : this.options}));
  },

  initialize : function(){
    this.model.bind('change:section', this.render, this);
  },

  _cleanup : function(){
    this.model.unbind('change:section', this.render, this);
  }


});