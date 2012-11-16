/*
 * Displays an individual frame in a discusison roll
 * Important that this display the entire conversation, newest message at top.
 */
libs.shelbyGT.DiscussionRollFrameView = libs.shelbyGT.ListItemView.extend({
  
  className : "discussion__item discussion__item--conversation js-discussion-roll-frame",
  
  options : _.extend({}, libs.shelbyGT.ListItemView.prototype.options, {
    msBetweenTimestamps: 15*60*1000 //15 minutes
  }),
  
  initialize : function(){
    this.model.get('conversation').on('change', this._renderMessages, this);
  },
  
  _cleanup: function(){
    this.model.off('change', this._renderMessages);
  },

  template: function(obj){
    return SHELBYJST['discussion-roll/frame'](obj);
  },
  
  _messageTemplate: function(obj){
    return SHELBYJST['discussion-roll/message'](obj);
  },
  
  render: function(){
    this.$el.html(this.template({frame: this.model, viewer: this.options.viewer}));
    this._renderMessages();

    libs.shelbyGT.ListItemView.prototype.render.call(this);
  },
  
  // rendering these separately so we don't destroy the video embed when a new message is posted
  _renderMessages: function(){
    var self = this,
    viewer = this.options.viewer,
    convoEl = this.$el.find(".js-discussion-roll-conversation");
    convoEl.empty();
    
    //loop vars
    var msgFromViewer,
    displayTimestamp,
    lastMsg = null;
    
    if(this.model.get('conversation') && this.model.get('conversation').get('messages').size() > 0){
      this.model.get('conversation').get('messages').each( function(msg){
        msgFromViewer = (msg.get('user_id') === viewer || msg.get('nickname') === viewer);
        displayTimestamp = !lastMsg || self._msBetweenMessages(lastMsg, msg) > self.options.msBetweenTimestamps;
        convoEl.append(self._messageTemplate({msg:msg, msgFromViewer:msgFromViewer, displayTimestamp:displayTimestamp}));
        lastMsg = msg;
      });
    }
    
    //scroll to bottom of conversation whenever messages are updated
    setTimeout(function(){ $("body").scrollTop(10000000000); }, 100);
  },
  
  _msBetweenMessages: function(msgA, msgB){
    if(typeof(msgA) === "undefined" || typeof(msgB) === "undefined"){ return 0; }
    if(!msgA || !msgB){ return 0; }
    var t1 = libs.shelbyGT.viewHelpers.app.timestampFromMongoId(msgA.id),
    t2 = libs.shelbyGT.viewHelpers.app.timestampFromMongoId(msgB.id);
    return t2 - t1;
  }
  
});