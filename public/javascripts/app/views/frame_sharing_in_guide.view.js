libs.shelbyGT.FrameSharingInGuideView = libs.shelbyGT.GuideOverlayView.extend({

  events : _.extend({}, libs.shelbyGT.GuideOverlayView.prototype.events, {
    "click .back:not(.js-busy)"  : "hide"
  }),

  className : 'frame-sharing',

  template : function(obj){
    return JST['frame-sharing'](obj);
  },

  initialize : function(){
  },

  _cleanup : function(){
  },

  render : function(){
    this.$el.html(this.template({frame:this.model}));
    
    //sharing view
    var shareFrameView = new libs.shelbyGT.ShareFrameView({model : new libs.shelbyGT.ShareModel(), frame : this.model});
    this.appendChildInto(shareFrameView, '.frame-sharing');
  }

});