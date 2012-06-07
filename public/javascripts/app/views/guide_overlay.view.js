// Subclass with a view that has class, tag, or id (not el) and this will handle
libs.shelbyGT.GuideOverlayView = Support.CompositeView.extend({
  
  insertIntoDom: function(reveal){
    $(".main").append(this.el);
    this._doPosition();
    if(reveal!==false){ this.reveal(); }
  },
  
  reveal: function(){
    //TODO: this should become a class just for guide-overlay (and removed from frame-rolling.scss)
    
    //TODO: confusing class name "rolling-frame-trans" -- it means "this view is showing" but doesn't say that
    // yes, the movement happens to be animated, but the class represents that it's showing, not that it's transitioning
    // so chanage it when we move it into
    
    this.$el.addClass('rolling-frame-trans');
  },
  
  hide: function(){
    this.$el.removeClass('rolling-frame-trans');
  },
  
  _doPosition: function(){
    var allHeadersHeight = _.reduce($("#js-app-header"), function(memo, el){ return memo + $(el).height(); }, 0);
    this.$el.css({top:allHeadersHeight, bottom:0});
  }
  
});