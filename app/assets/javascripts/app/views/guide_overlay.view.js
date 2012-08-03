// Subclass with a view that has class, tag, or id (not el) and this will handle
libs.shelbyGT.GuideOverlayView = Support.CompositeView.extend({
  
  events : {
    "webkitTransitionEnd"  : "_onSlideComplete",
    "transitionend"        : "_onSlideComplete",
    "MSTransitionEnd"      : "_onSlideComplete",
    "oTransitionEnd"       : "_onSlideComplete"
  },

  className : 'guide-overlay',

  reveal: function(){
    this.$el.addClass('showing');
  },
  
  hide: function(){
    console.log(this.$el.removeClass('showing'));
  },
  
  _setGuideOverlayStateNone: function(){
    console.log('setting guide overlay state:none');
    this.options.guideOverlayModel.clearAllGuideOverlays();
  },

  _onSlideComplete: function(){
    if (!this.$el.hasClass('showing')) {
      this.leave();
    }
  }

});
