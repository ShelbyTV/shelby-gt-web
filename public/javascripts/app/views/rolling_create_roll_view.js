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
    },
  
    render : function(){
      this.$el.html(this.template());
    },
  
    rollToNew : function(){
      var self = this;
      
      if( !this._validateForm() ){ 
        this.options.frameRollingState.set('doShare', ShareActionState.failed);
        return; 
      }
  
      this.options.frameRollingState.set({doShare:ShareActionState.share});
    
      roll = new RollModel({
        'title' : this.$("#new-roll-name").val(),
        collaborative : true
      });
    
      if(this.$("#new-roll-public").attr('checked') === 'checked') {
        this.options.frameRollingState.get('shareModel')._buildNetworkSharingState(shelby.models.user);
        roll.set({public: true});
      } else {
        roll.set({public: false});
      }

      if(this.$("#new-roll-receipients").val() > 0){
        this.options.frameRollingState.get('shareModel').set('destination',['email']);
        roll.set({addresses: this.$("#new-roll-receipients").val()});
      } else {
        this.options.frameRollingState.get('shareModel').set('destination',['']);
      }
    
      // have to create the new roll and then reroll
      roll.save(null, {
        success : function(newRoll){
          console.log("rolling create roll created roll", newRoll);
          shelby.models.rollFollowings.add(newRoll);
          self.options.frame.reRoll(newRoll, function(newFrame){
            //TODO: show success message?
            self.options.frameRollingState.set({doShare:ShareActionState.complete});
            //TODO: don't auto-play, just show it
            shelby.router.navigate('roll/'+newFrame.get('roll_id')+'/frame/'+newFrame.id+'?reroll_success=true', {trigger:true});
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