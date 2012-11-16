/*
 * Gives the user the ability to reply to this discussion roll.
 * Since it's just a regular Roll with the most recent message shown at the bottom,
 * the user just replies to the most recent Frame (displayed via the DiscussionRollConversationView)
 * and only that Frame (ie not showing reply to conversation for older Frames)
 */
libs.shelbyGT.DiscussionRollReplyView = Support.CompositeView.extend({
  
  events : {
    "click .js-post-message" : "_postMessage",
  },
  
  el: '.js-discussion-roll-reply',
  
  /*
   * Need to post new messages to the latest frame.
   * Since PagingListView fucks with the collection we hold in model, we
   * can't rely on that to provide us the latest frame.
   * So we track it manually whenever there are updates via _updateLatestFrame.
   * (didn't, but could also have done this with the masterCollection of PagingListView)
   */
  _latestFrame: null,
  
  initialize : function(){
    this.model.on('change:id', this.render, this);
    this.model.on('change', this._updateLatestFrame, this);
    
    this._updateLatestFrame();
    this.render();    
  },
  
  _cleanup : function(){
    this.model.on('change:id', this.render);
    this.model.off('change', this._updateLatestFrame);
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
          self._updateLatestFrame();
        } else {
          self._latestFrame.get('conversation').set(respModel);
        }
      },
      error:function(){
        msgInput.addClass("error");
        console.log('err', arguments);
      }
    });
  },
  
  _updateLatestFrame: function(){
    var f = this.model.get('frames').first();
    if( typeof(f) === "undefined" ){ return; }
    if( this._latestFrame === null || f.id > this._latestFrame.id ){ this._latestFrame = f; }
  }
  
});
  
  