( function(){

  // shorten names of included library prototypes
  var ShareView = libs.shelbyGT.ShareView;
  var ShareActionState = libs.shelbyGT.ShareActionState;

  libs.shelbyGT.ShareFrameView = libs.shelbyGT.ShareView.extend({
    
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
            
      this.parent.hide();
    }
    
  });
  
} ) ();