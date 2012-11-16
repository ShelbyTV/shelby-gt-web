/*
 * Displays an individual frame in a discusison roll
 * Important that this display the entire conversation, newest message at top.
 */
libs.shelbyGT.DiscussionRollFrameView = libs.shelbyGT.ListItemView.extend({
  
  className : "discussion__item discussion__item--conversation js-discussion-roll-frame",
  
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
    
    if(this.model.get('conversation') && this.model.get('conversation').get('messages').size() > 0){
      this.model.get('conversation').get('messages').each( function(msg){
        var msgFromViewer = (msg.get('user_id') === viewer || msg.get('nickname') === viewer);
        convoEl.append(self._messageTemplate({msgFromViewer:msgFromViewer, msg:msg}));
      });
    }
  }
  
});