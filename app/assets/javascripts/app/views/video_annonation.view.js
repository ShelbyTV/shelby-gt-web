libs.shelbyGT.VideoAnnotationView = Support.CompositeView.extend({

  tagName: 'div',

  className: 'annotation frame-body-wrapper',

  template : function(obj){
    return SHELBYJST['video-annotation'](obj);
  },

  render : function(){
    this.$el.html(this.template({
      event: this.model
    }));
  }

});