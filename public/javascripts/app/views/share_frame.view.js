( function(){

  // shorten names of included library prototypes
  var ShareView = libs.shelbyGT.ShareView;
  var ShareActionState = libs.shelbyGT.ShareActionState;

  itermediate = libs.shelbyGT.GuideOverlayView.extend({});

  libs.shelbyGT.ShareFrameView = libs.shelbyGT.ShareView.extend({
    
    saveUrl: function(){
      return shelby.config.apiRoot + '/frame/' + this.options.frame.id + '/share';
    },
    
    onShareSuccess: function(){
      libs.shelbyGT.ShareView.prototype.onShareSuccess.call(this);
      
      this.parent.hide();
    },
    
  });
  
} ) ();