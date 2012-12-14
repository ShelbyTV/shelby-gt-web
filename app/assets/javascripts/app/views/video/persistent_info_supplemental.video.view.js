libs.shelbyGT.PersistentInfoSupplementalView = Support.CompositeView.extend({

  tagName : 'div',

  className: 'persistent_video_info persistent_video_info--supplemental animate_module js-supplemental-video-info',

  template : function(obj) {
    return SHELBYJST['video/persistent-video-supplemental'](obj);
  },

  render : function() {
    this.$el.html(this.template({eventModel: this.model}));
  }

});