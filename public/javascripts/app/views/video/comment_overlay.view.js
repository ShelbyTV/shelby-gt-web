( function(){

  libs.shelbyGT.CommentOverlayView = Support.CompositeView.extend({

    _messageIndex: 0,

    events : {
      "click .js-message-prev:not(.message-terminus)"  : "_prevMessage",
      "click .js-message-next:not(.message-terminus)"  : "_nextMessage"
    },

    el: '#js-comment-overlay',

    initialize : function(){
      this.model.bind('change:activeFrameModel', this._onActiveFrameModelChange, this);
    },

    _cleanup : function(){
      this.model.unbind('change:activeFrameModel', this._onActiveFrameModelChange, this);
      if (this.model.has('activeFrameModel')) {
        this.model.get('activeFrameModel').get('conversation').off('change', this._onConversationChange, this);
      }
    },
    
    render : function(frame){
      this.$el.html(this.template({frame:frame}));
    },

    _onActiveFrameModelChange : function(guideModel, activeFrameModel){
      if (guideModel.previous('activeFrameModel')) {
        guideModel.previous('activeFrameModel').get('conversation').off('change', this._onConversationChange, this);
      }
      activeFrameModel.get('conversation').on('change', this._onConversationChange, this);
      this._messageIndex = 0;
      this._renderMessageView(activeFrameModel);
    },

    _onConversationChange : function() {
      this._renderMessageView(this.model.get('activeFrameModel'));
    },

    _prevMessage : function(){
      this._messageIndex--;
      this._renderMessageView(this.model.get('activeFrameModel'));
    },

    _nextMessage : function(){
      this._messageIndex++;
      this._renderMessageView(this.model.get('activeFrameModel'));
    },

    _renderMessageView : function(frame){
      var useFrameCreatorInfo = frame.conversationUsesCreatorInfo(shelby.models.user);
      var messages = frame.get('conversation').get('messages');
      var messageViewParams;
      if (this._messageIndex == 0) {
        messageViewParams = useFrameCreatorInfo ? {frame:frame} : {model:messages.first()};
      } else {
        var messageModel = messages.at(useFrameCreatorInfo ? this._messageIndex - 1 : this._messageIndex);
        messageViewParams = {model:messageModel};
      }

      // render the currently selected message
      var messageView = new libs.shelbyGT.MessageView(messageViewParams);
      this._leaveChildren();
      this.insertChildBefore(messageView, '.comment-overlay-next');

      // update the button states, disabling the previous/next buttons if we're at either end of the list
      if (this._messageIndex == 0) {
        this.$('.js-message-prev').addClass('message-terminus');
      } else {
        this.$('.js-message-prev').removeClass('message-terminus');
      }

      var messageCount = frame.get('conversation').get('messages').length;
      var maxIndex = messageCount - (frame.conversationUsesCreatorInfo(shelby.models.user) ? 0 : 1);
      if (this._messageIndex == maxIndex) {
        this.$('.js-message-next').addClass('message-terminus');
      } else {
        this.$('.js-message-next').removeClass('message-terminus');
      }
    }

  });

} ) ();
