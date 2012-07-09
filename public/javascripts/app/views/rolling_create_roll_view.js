( function(){
  
  var RollModel = libs.shelbyGT.RollModel;
  var ShareActionState = libs.shelbyGT.ShareActionState;

  // Subclass with a view that has class, tag, or id (not el) and this will handle
  libs.shelbyGT.RollingCreateRollView = Support.CompositeView.extend({
  
    events : {
      "click #new-roll-create" : 'rollToNew',
      "focus #new-roll-name" : "_onFocusRollName",
      "focus #new-roll-receipients" : "_onFocusRollRecipients"
    },
  
    className : 'create-roll clearfix',

    template : function(obj){
      return JST['frame-rolling-create-roll'](obj);
    },
  
    initialize : function(){
      this._frameRollingState = this.options.frameRollingState;
    },
  
    render : function(){
      this.$el.html(this.template());
    },
  
    rollToNew : function(){
      var self = this;
      
      if( !this._validateForm() ){ 
        this._frameRollingState.set('doShare', ShareActionState.failed);
        return; 
      }
  
      this._frameRollingState.set({doShare:ShareActionState.share});
    
      roll = new RollModel({
        'title' : this.$("#new-roll-name").val(),
        collaborative : true
      });
    
      roll.set({'public': !this.$("#new-roll-status").is(':checked')});

      var doShare = false;
      if(this.$("#new-roll-recipients").val().length > 0){
        this._frameRollingState.get('shareModel').set({
          destination: ['email'],
          addresses: this.$("#new-roll-recipients").val()
          });
        doShare = true;
      } else {
        this._frameRollingState.get('shareModel').set({destination: ['']});
      }
      
      // have to create the new roll and then reroll
      roll.save(null, {
        success : function(newRoll){
          shelby.models.rollFollowings.add(newRoll);
          self.options.frame.reRoll(newRoll, function(newFrame){
            
            //complete rolling and change screens now, allow email action to happen afterward
            self._frameRollingState.set({doShare:ShareActionState.complete});
            shelby.router.navigate('roll/'+newFrame.get('roll_id')+'/frame/'+newFrame.id+'?reroll_success=true', {trigger:true});
            
            if (doShare) {
              //synchronously invite users to this roll via email
              self.options.frameRollingState.get('shareModel').save(null, {
                url : newFrame.shareUrl(),
                success : function(){
                  /* noop */
                }
              });
            }

          });
        }});
    },
    
    _validateForm : function(){
      validates = true;

      if( this.$("#new-roll-name").val().length < 1 ){
        this.$('#new-roll-name').addClass('error');
        validates = false;
      }
      
      //TODO: validate email addresses
      
      return validates;
    },
    
    _onFocusRollName : function(){
      // remove the error highlight from the roll title input on focus if there is one
      this.$('#new-roll-name').removeClass('error');
    },

    _onFocusRollRecipients : function(){
      // remove the error highlight from the roll title input on focus if there is one
      this.$('#new-roll-receipients').removeClass('error');
    }
  
  });

} ) ();