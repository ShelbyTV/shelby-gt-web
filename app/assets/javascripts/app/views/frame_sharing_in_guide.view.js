libs.shelbyGT.FrameSharingInGuideView = libs.shelbyGT.GuideOverlayView.extend({

  events : {
    "click .back:not(.js-busy)"  : "cancel"
  },

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

    this.insertIntoDom(false);
  },

  cancel : function(){
    this.hide();
  }
  
});