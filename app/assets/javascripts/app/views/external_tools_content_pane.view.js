libs.shelbyGT.ExternalToolsContentPaneView = Support.CompositeView.extend({

  tagName: 'section',

  className: 'content_module external-tools',

  template : function(obj){
      return JST['external-tools-content-pane'](obj);
  },

  render : function(){
    this.$el.html(this.template());
  }

});