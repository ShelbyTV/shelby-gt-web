libs.shelbyGT.FrameRollingFooterView = Support.CompositeView.extend({

  events : {
    "click .js-back" : "_goBack"
  },

  tagName : 'div',

  className : 'footer',

  template : function(obj){
    return JST['frame-rolling-footer'](obj);
  },

  render : function(){
    this.$el.html(this.template({}));
  },

  _goBack : function(){
    this.parent.$el.removeClass('rolling-frame-trans');
  }

});
