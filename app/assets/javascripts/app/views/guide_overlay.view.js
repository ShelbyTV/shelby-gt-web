// Subclass with a view that has class, tag, or id (not el) and this will handle
libs.shelbyGT.GuideOverlayView = Support.CompositeView.extend({
  
  events : {
    "webkitTransitionEnd"  : "_onSlideComplete",
    "transitionend"        : "_onSlideComplete",
    "MSTransitionEnd"      : "_onSlideComplete",
    "oTransitionEnd"       : "_onSlideComplete"
  },

  insertIntoDom: function(reveal){
    $(".js-guide").append(this.el);
    this.delegateEvents(true);
    this.$el.addClass("guide-overlay");
    if(reveal!==false){ this.reveal(); }
  },
  
  reveal: function(){
    this.$el.addClass('showing');
  },
  
  hide: function(){
    this.$el.removeClass('showing');
    shelby.models.guide.set('activeGuideOverlayView', null);
  },

  _onSlideComplete: function(){
    if (!this.$el.hasClass('showing')) {
      this.$el.remove();
    }
  }

});