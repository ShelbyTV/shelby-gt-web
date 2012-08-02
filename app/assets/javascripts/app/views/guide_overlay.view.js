// Subclass with a view that has class, tag, or id (not el) and this will handle
libs.shelbyGT.GuideOverlayView = Support.CompositeView.extend({
  
  events : {
    "webkitTransitionEnd"  : "_onSlideComplete",
    "transitionend"        : "_onSlideComplete",
    "MSTransitionEnd"      : "_onSlideComplete",
    "oTransitionEnd"       : "_onSlideComplete"
  },

  className : 'guide-overlay',

  insertIntoDom: function(){
    this.delegateEvents(true);
  },

  reveal: function(){
    this.$el.addClass('showing');
  },
  
  hide: function(){
    this.$el.removeClass('showing');
  },

  doPosition: function(){
    var allHeadersHeight = _.reduce($(".js-app-header"), function(memo, el){ return memo + $(el).height(); }, 0);
    this.$el.css({top:allHeadersHeight, bottom:0});
  },
  
  _setGuideOverlayStateNone: function(){
    this.options.guideOverlayModel.clearAllGuideOverlays();
  },

  _onSlideComplete: function(){
    if (!this.$el.hasClass('showing')) {
      this.leave();
    }
  }

});