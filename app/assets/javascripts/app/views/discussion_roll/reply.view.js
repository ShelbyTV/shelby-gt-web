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
      success:function(model, resp){
        msgInput.val('');
        //NOTE: in the future, model may be a Frame, in which case we add that to self.model
        //      but for now, model is a Conversation, which we just need to update in self.model
        self.model.get('frames').last().get('conversation').set(model);
      },
      error:function(){
        msgInput.addClass("error");
        console.log('err', arguments);
      }
    });
  }
  
});
  
  