libs.shelbyGT.FrameRollingFooterView = Support.CompositeView.extend({



  tagName : 'div',

  className : 'footer',

  template : function(obj){
    return JST['frame-rolling-footer'](obj);
  },

  render : function(){
    this.$el.html(this.template({}));
  },

  _goBack : function(){
    this.$el.removeClass('rolling-frame-trans');
  }

});
