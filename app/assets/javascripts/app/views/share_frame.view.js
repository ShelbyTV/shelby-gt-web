( function(){

  // shorten names of included library prototypes
  var ShareView = libs.shelbyGT.ShareView;

  libs.shelbyGT.ShareFrameView = ShareView.extend({
    
    options : _.extend({}, ShareView.prototype.options, {
      guideOverlayModel : null
    }),
    
    _components : _.extend({}, ShareView.prototype._components, {
      networkToggles: false,
      emailAddresses: true,
      messageCounter: false,
      shareButtonCopy: "Send"
    }),
    
    _share : function(){
      var self = this;

      if(!this._validateShare()) {
        this.$('.js-share-textarea, .js-share-email-addresses').addClass('error');
        this.onValidationFail();
        return false;
      }
      
      if (this.options.frame) {
        libs.utils.rhombus.sadd('shares', this.options.frame.id);
      }

      this.$('.js-share-textarea').removeClass('error');
      if (this._components.shareButton) {
        this.$('.js-submit-share').addClass('js-sharing');
      }
      this._components.spinner && this._showSpinner();
      
      //adjust the model for what the POST discussion_roll route expects
      var modelAttrs = {
        participants: this.$('.js-share-email-addresses').val(),
        message: this.model.get('text'),
        destination: null,
        text: null,
        addresses: null
        };
      //routes needs frame_id, video_id, or video_source_url
      if( this.options.frame.hasBsonId() ){
        modelAttrs['frame_id'] = this.options.frame.id;
      } else if( this.options.frame.get('video').hasBsonId() ) {
        modelAttrs['video_id'] = this.options.frame.get('video').id;
      } else {
        modelAttrs['video_source_url'] = this.options.frame.get('video').get('source_url');
      }
      this.model.set(modelAttrs);
      
      //save adjusted model to discussion_roll route
      this.model.save(null, {
        url: shelby.config.apiRoot + '/discussion_roll',
        success: function(model, resp){
          self._clearTextArea();
          self._components.spinner && self._hideSpinner();
          self.onShareSuccess();
          self.options.onShareSuccess && self.options.onShareSuccess(model, resp);
        },
        error: function(){
          self._handleShareError();
        }
      });
      return false;
    },
    
    onShareSuccess: function(){
      libs.shelbyGT.ShareView.prototype.onShareSuccess.call(this);
      
      shelby.track( 'shared_frame',
                    { destination: 'discussion_roll',
                      id: this.options.frame.id,
                      userName: shelby.models.user.get('nickname')
                  });
            
      this.options.guideOverlayModel.clearAllGuideOverlays();
    }
    
  });
  
} ) ();