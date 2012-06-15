// Subclass with a view that has class, tag, or id (not el) and this will handle
libs.shelbyGT.GuideOverlayView = Support.CompositeView.extend({
  
  insertIntoDom: function(reveal){
    $(".main").append(this.el);
    this.$el.addClass("guide-overlay");
    this._doPosition();
    if(reveal!==false){ this.reveal(); }
  },
  
  reveal: function(){
    this.$el.addClass('showing');
  },
  
  hide: function(){
    this.$el.removeClass('showing');
  },
  
  _doPosition: function(){
    var allHeadersHeight = _.reduce($(".js-app-header"), function(memo, el){ return memo + $(el).height(); }, 0);
    this.$el.css({top:allHeadersHeight, bottom:0});
  }
  
});