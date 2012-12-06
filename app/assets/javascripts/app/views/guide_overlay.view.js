// Subclass with a view that has class, tag, or id (not el) and this will handle
libs.shelbyGT.GuideOverlayView = Support.CompositeView.extend({
  
  events : {
    "webkitTransitionEnd"  : "_onTransitionEnd",
    "transitionend"        : "_onTransitionEnd",
    "MSTransitionEnd"      : "_onTransitionEnd",
    "oTransitionEnd"       : "_onTransitionEnd"
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

  //this is called when any transition ends, not just the hiding slide transition
  _onTransitionEnd: function(){
    if (!this.$el.hasClass('showing')) {
      this.leave();
      if (this.parent.children.value().length == 0) {
        this.parent.$el.hide();
      }
    }
  }

});
