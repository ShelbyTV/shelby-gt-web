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
      libs.shelbyGT.ShareView.prototype.onShareSuccess.call(this);
      
      shelby.track( 'shared_frame',
                    { destination: this.model.get('destination').join(', '),
                      id: this.options.frame.id,
                      userName: shelby.models.user.get('nickname')
                  });
            
      this.options.guideOverlayModel.clearAllGuideOverlays();
    }
    
  });
  
} ) ();