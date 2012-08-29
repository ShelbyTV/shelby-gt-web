// Subclass with a view that has class, tag, or id (not el) and this will handle
libs.shelbyGT.GuideOverlayView = Support.CompositeView.extend({
  
  events : {
    "webkitTransitionEnd"  : "_onSlideComplete",
    "transitionend"        : "_onSlideComplete",
    "MSTransitionEnd"      : "_onSlideComplete",
    "oTransitionEnd"       : "_onSlideComplete"
  },

  className : 'animate_module guide-overlay',

  reveal: function(){
    this.$el.addClass('showing');
  },
  
  hide: function(){
    this.$el.removeClass('showing');
  },
  
  _setGuideOverlayStateNone: function(){
    this.options.guideOverlayModel.clearAllGuideOverlays();
  },

  _onSlideComplete: function(){
    if (!this.$el.hasClass('showing')) {
      this.leave();
      if (this.parent.children.value().length == 0) {
        this.parent.$el.hide();
      }
    }
  }

});
