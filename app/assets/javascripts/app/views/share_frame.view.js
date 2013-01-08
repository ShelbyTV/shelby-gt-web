/*
 * DiscusisonRoll creating/updating.
 *
 * If child view (FrameSharingRollChooserView) is shown and has a previous discusison roll chosen,
 * we post a new message to that roll.  Otherwise we create a new roll.
 */
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
    
    render : function(){
      libs.shelbyGT.ShareView.prototype.render.call(this);
      
      //easily choose from previous discussion rolls
      var discussionRollChooser = new libs.shelbyGT.FrameSharingRollChooserView({
        input: this.$("#email-recipients")
      });
      this.renderChildInto(discussionRollChooser, this.$(".discussion-roll-chooser-wrapper"));
    },
    
    shouldValidateEmail : function(){
      //only validate when email input is visible
      return this.$("#email-recipients:visible").length === 1;
    },
    
    _share : function(){
      var self = this;

      if(!this._validateShare()) {
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
      
      var url = shelby.config.apiRoot + '/discussion_roll';
      
      // post new message to previous discussion roll, if chosen
      var selectedRollId = this.$("#js-discussion-roll-chooser option:selected").val();
      if(typeof(selectedRollId) !== "undefined" && selectedRollId !== "false"){ 
        url += '/'+selectedRollId+'/messages';
        var token = this.$("#js-discussion-roll-chooser option:selected").data('token');
      }
      
      //save adjusted model to discussion_roll route
      this.model.save(null, {
        url: url,
        success: function(model, resp){
          self._clearTextArea();
          self._components.spinner && self._hideSpinner();
          self.onShareSuccess(model, resp, selectedRollId, token);
        },
        error: function(){
          self._handleShareError();
        }
      });
      return false;
    },
    
    onShareSuccess: function(model, resp, selectedRollId, token){
      libs.shelbyGT.ShareView.prototype.onShareSuccess.call(this);
      
      shelby.track( 'shared_frame',
                    { destination: 'discussion_roll',
                      id: this.options.frame.id,
                      userName: shelby.models.user.get('nickname')
                  });
            
      this.options.guideOverlayModel.clearAllGuideOverlays();
      
      // two different ways to access the conversation based on if we posted to create or create_message
      if(typeof(selectedRollId) === "undefined" || selectedRollId === "false"){
        //if this was a new conversation, model is a discussionRoll; get roll id and token from there
        selectedRollId = model.id;
        token = model.get('token');
      }
      
      //show success with link to discussion roll
      var href = shelby.config.appUrl+'/chat/'+selectedRollId+'?u='+shelby.models.user.id+'&t='+token;
      shelby.success('Message Sent! <span class="message-link"><a href="'+href+'" class="js-open-popup">Open Conversation</a></span>');
    }
    
  });
  
} ) ();