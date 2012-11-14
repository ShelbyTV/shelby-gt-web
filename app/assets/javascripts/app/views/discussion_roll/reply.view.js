/*
 * Gives the user the ability to reply to this discussion roll.
 * Since it's just a regular Roll with the most recent message shown at the bottom,
 * the user just replies to the most recent Frame (displayed via the DiscussionRollConversationView)
 * and only that Frame (ie not showing reply to conversation for older Frames)
 */
libs.shelbyGT.DiscussionRollReplyView = Support.CompositeView.extend({
  
  events : {
    "click .js-post-message"    : "_postMessage",
  },
  
  el: '.js-discussion-roll-reply',
  
  initialize : function(){
    this.model.on('change:id', this.render, this);
    this.render();    
  },
  
  _cleanup : function(){
    this.model.on('change:id', this.render, this);
  },
  
  template : function(obj){
    return SHELBYJST['discussion-roll/reply'](obj);
  },
  
  render : function(){
    this.$el.html(this.template());
  },
  
  _postMessage : function(e){
    var self = this;
    
    e.stopPropagation();
    e.preventDefault();
    
    //error checking on input
    var msgInput = this.$el.find('.js-message-text'),
    text = msgInput.val();
    if(typeof(text) !== "string" || text.length < 1){
      msgInput.addClass("error");
      return;
    } else {
      msgInput.removeClass("error");
    }
    
    //post new message
    var msg = new libs.shelbyGT.DiscussionRollMessageModel({message:text, token:this.options.token, discussion_roll_id:this.model.id});
    msg.save(null, {
      success:function(respModel, resp){
        msgInput.val('');
        // respModel may have an array of Frames, in which case we add them to self.model
        // otherwise it's a Conversation, which we just need to update in self.model
        if( respModel.get('frames') ){
          respModel.get('frames').forEach(function(f){
            self.model.get('frames').add(f, {at:0});
          });
        } else {
          self.model.get('frames').first().get('conversation').set(respModel);
        }
      },
      error:function(){
        msgInput.addClass("error");
        console.log('err', arguments);
      }
    });
  }
  
});
  
  