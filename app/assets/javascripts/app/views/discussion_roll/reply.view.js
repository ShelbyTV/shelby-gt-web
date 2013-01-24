/*
 * Gives the user the ability to reply to this discussion roll.
 *
 * Since it's just a regular Roll with the most recent message shown at the bottom,
 * the user just replies to the most recent Frame (displayed via the DiscussionRollConversationView)
 * and only that Frame (ie not showing reply to conversation for older Frames)...
 *
 * But, when the reply includes a video (inline URL or out of band), the API returns a new array of
 * Frames for the videos and the message will be appended to the conversation of the last one.
 *
 * Creates a SelectVideoAttachmentView for easy attachment of videos.  Acts as delegate to that view
 * and receives the video selected.  Handles the attachment form there.
 */
libs.shelbyGT.DiscussionRollReplyView = Support.CompositeView.extend({
  
  events : {
    "click .js-post-message"            : "_postMessage",
    "click .js-add-video-attachment"    : "_showVideoAttachmentView"
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
  
  // if the viewer is a real Shelby user, they will be stored here
  _user: null,
  
  initialize : function(){
    this.model.on('change:id', this.render, this);
    this.model.on('change', this._updateLatestFrame, this);
    
    this._getViewerShelbyModel();
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
    this.$el.html(this.template({user:this._user}));
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
    
    //post new message to server
    this._syncNewMessage(text, null);
  },
  
  _syncNewMessage: function(text, videoUrls){
    if(!text && !videoUrls){ return; }
    
    var 
    self = this,
    msgInput = this.$el.find('.js-message-text'),
    msg = new libs.shelbyGT.DiscussionRollMessageModel({
      message: text, 
      token: this.options.token, 
      discussion_roll_id: this.model.id,
      videos: videoUrls
    });
    
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
        
        setTimeout(function(){ $("body").scrollTop(10000000000); }, 100);
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
  },
  
  //if the viewer is an actual shelby model, we want to show their avatar
  _getViewerShelbyModel: function(){
    var self = this;
    
    if(this.options.viewer.indexOf("@") === -1){    
      this._user = new libs.shelbyGT.UserModel({id: this.options.viewer});
      this._user.fetch({
        success: function(userModel, resp){
          self.render();
        }
      });
    }
    
  },
  
  _showVideoAttachmentView: function(e){
    e.stopPropagation();
    e.preventDefault();
    
    // If a video is selected, it's sent to us via addVideoAttachment()
    // DiscussionRollSelectVideoAttachmentView handles rendering, possibly selecting, hiding itself.
    this._scrollTopWhenHidden = $("body").scrollTop();
    $(".js-discussion").addClass('discussion-attachment-shown');
    new libs.shelbyGT.DiscussionRollSelectVideoAttachmentView({delegate: this});
  },
  
  videoAttachmentViewDidDisappear: function(){
    $(".js-discussion").removeClass('discussion-attachment-shown');
    $("body").scrollTop(this._scrollTopWhenHidden);
  },
  
  /*
   * delegate method for SelectVideoAttachmentView.
   * Immediately causes the video to be posted to the conversation.
   * opts should = {
   *  url: the url to send to the api
   *  thumbnailUrl: - the url to a thumbnail to display
   *  }
   */
  addVideoAttachment: function(opts){
    if(!opts.url){ return; }
    this._syncNewMessage(null, [opts.url]);
  }
  
});
  
  