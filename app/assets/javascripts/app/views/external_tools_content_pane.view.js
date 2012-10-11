libs.shelbyGT.ExternalToolsContentPaneView = Support.CompositeView.extend({

  tagName: 'section',

  className: 'content_module external-tools',

  options : _.extend({}, Support.CompositeView.prototype.options, {
    displayExtension : Browser.isChrome()
  }),

  template : function(obj){
      return SHELBYJST['external-tools-content-pane'](obj);
  },

  render : function(){
    this.$el.html(this.template({opts : this.options}));
  }

});