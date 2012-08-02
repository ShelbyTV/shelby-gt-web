( function(){

  // shorten names of included library prototypes
  var ShareView = libs.shelbyGT.ShareView;

  libs.shelbyGT.ShareFrameView = ShareView.extend({
    
    options : _.extend({}, ShareView.prototype.options, {
      guideOverlayModel : null
    }),

    saveUrl: function(){
      return shelby.config.apiRoot + '/frame/' + this.options.frame.id + '/share';
    },
    
    onShareSuccess: function(){
      ShareView.prototype.onShareSuccess.call(this);
      this.options.guideOverlayModel.clearAllGuideOverlays();
    }
    
  });
  
} ) ();