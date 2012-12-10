libs.shelbyGT.FrameSharingInGuideView = libs.shelbyGT.GuideOverlayView.extend({

  events : _.extend({}, libs.shelbyGT.GuideOverlayView.prototype.events, {
    "click .js-cancel:not(.js-busy)"  : "_setGuideOverlayStateNone"
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
      frame : this.model,
      onShareSuccess : this.onShareSuccess
    });
    this.appendChildInto(shareFrameView, '.frame-sharing');

    libs.shelbyGT.GuideOverlayView.prototype.render.call(this);
  },
  
  onShareSuccess: function(discussionRoll, raw){
    var href = shelby.config.appUrl+'/chat/'+discussionRoll.id+'?u='+shelby.models.user.id+'&t='+discussionRoll.get('token');
    shelby.success('Message Sent! <span class="message-link"><a href="'+href+'" class="js-open-popup">Open Conversation</a></span>');
  }

});