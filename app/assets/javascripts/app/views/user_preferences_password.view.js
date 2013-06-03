libs.shelbyGT.UserPreferencesPasswordView = Support.CompositeView.extend({

  tagName: 'div',

  className: 'content_lining',

  options : _.extend({}, Support.CompositeView.prototype.options, {}),

  template : function(obj){
      return SHELBYJST['preferences-password'](obj);
  },

  render : function(){
    console.log('opts',this);
    this.$el.html(this.template());
  },

  initialize : function(){
    console.log('user password!');
    // this.model.bind('change:section', this.render, this);
  },

  _cleanup : function(){
    // this.model.unbind('change:section', this.render, this);
  }


});