libs.shelbyGT.FrameSharingInGuideView = libs.shelbyGT.GuideOverlayView.extend({

  events : _.extend({}, libs.shelbyGT.GuideOverlayView.prototype.events, {
    "click .js-cancel:not(.js-busy)"      : "_setGuideOverlayStateNone"
  }),

  className : libs.shelbyGT.GuideOverlayView.prototype.className + ' frame-sharing',

  template : function(obj){
    return SHELBYJST['frame-sharing'](obj);
  },

  render : function(){
    this.$el.html(this.template({frame:this.model}));
    
    //sharing view
    var shareFrameView = new libs.shelbyGT.ShareFrameView({
      model : new libs.shelbyGT.ShareModel(),
      guideOverlayModel : this.options.guideOverlayModel,
      frame : this.model
    });
    this.appendChildInto(shareFrameView, '.frame-sharing');

    libs.shelbyGT.GuideOverlayView.prototype.render.call(this);
  }
  
});