/*
 * Displays an invidividual recipient (shelby users or not) whom this discussion roll is with.
 *
 * If recipient is email only, just displays email address.  Otherwise display the Shelby user's nickname. 
 * Will get additional user info from the API if it's not available locally
 */
libs.shelbyGT.DiscussionRollRecipientView = Support.CompositeView.extend({
  
  //no el b/c we are rendered by DiscussionRollRecipientsView via appendChildInto
  tagName: 'li',

  className: 'discussion__item discussion__item--recipients',

  initialize : function(){
    //model is email address or bson id (as string)
    
    if(this.model.indexOf("@") === -1){
      this._renderShelbyRecipient();
    } else {
      this._renderEmailRecipient();
    }
    
    if(this.options.overflow){
      this.$el.addClass("discussion__item--recipients-overflow");
    }
  },

  _renderEmailRecipient : function(){
    this.$el.html(SHELBYJST['discussion-roll/email-recipient']({emailAddress:this.model}));
    
    if(this.options.updatePageTitle){
      document.title += " "+this.model+", ";
    }
  },
  
  _renderShelbyRecipient : function(){
    var self = this,
    userInfo = this._getShelbyUserInfoFromRoll();
    
    if(userInfo){
      this.$el.html(SHELBYJST['discussion-roll/shelby-recipient']({shelbyUserInfo:userInfo}));
      if(this.options.updatePageTitle){
        document.title += " "+userInfo.nickname+",";
      }
    } else {
      this._user = new libs.shelbyGT.UserModel({id: this.model});
      this._user.fetch({
        success: function(userModel, resp){
          self.$el.html(SHELBYJST['discussion-roll/shelby-recipient']({shelbyUserInfo:{
            nickname: userModel.get('nickname'),
            name: userModel.get('name')
            }}));
          if(self.options.updatePageTitle){
            document.title += " "+userModel.get('nickname')+",";
          }
        }
      });
    }
  },
  
  //returns {nickname: "nick", name: "Real Name"} if user info is found locally, else null
  _getShelbyUserInfoFromRoll : function(){
    var recipientUserId = this.model, 
    userInfo = null;
    
    //search all the frames' messages for the desired user
    if( this.options.discussionRoll && this.options.discussionRoll.get('frames') ){
      this.options.discussionRoll.get('frames').forEach(function(frame){
        if(frame.get('conversation') && frame.get('conversation').get('messages')){
          frame.get('conversation').get('messages').forEach(function(msg){
            if(msg.get('user_id') == recipientUserId){
              userInfo = { 
                nickname: msg.get('nickname'),
                name: msg.get('realname')
                };
            }
          });
        }
      });
    }
    return userInfo;
  }

});