( function(){
  
  libs.shelbyGT.FrameConversationView = libs.shelbyGT.GuideOverlayView.extend({
    
    events : {
      "click .back:not(.js-busy)" : "_goBack",
      "click .new-comment-submit" : "_addMessage",
      "click .reply" : "_reply"
    },

    className : 'conversation-overlay',

    template : function(obj){
      return JST['frame-conversation'](obj);
    },

    initialize : function(){
      this.model.get('conversation').on('change', this._onConversationChange, this);
    },
    
    _cleanup : function(){
      this.model.get('conversation').off('change', this._onConversationChange, this);
    },

    render : function(){
      var self = this;
      
      this.$el.html(this.template({ frame : this.model }));
      
      this.model.get('conversation').get('messages').each(function(message){
        var messageView = new libs.shelbyGT.MessageView({model:message});
        self.renderChild(messageView);
        self.$('.conversation').append(messageView.el);
      });
      
      this.insertIntoDom(false);
    },
    
    _onConversationChange : function(){
      this.render(true);
    },
    
    _renderError : function(msg){
      this.$('.js-add-message-input').addClass('error');
      return false;
    },
    
    _goBack : function(){
      this.hide();
    },
    
    _reply : function(e){
      e.preventDefault();
      var replyTo = $(e.currentTarget).data('reply_to');
      this.$('.js-add-message-input').val('@'+replyTo+' ');
      this.$('.js-add-message-input').focus();
    },
    
    _addMessage : function(){
      var self = this;
      var text = this.$('.js-add-message-input').val();

      if (!this._isMessageValid(text)) {
        this._renderError('Why not say something?');
        return false;
      }
      var msg = new libs.shelbyGT.MessageModel({text:text, conversation_id:this.model.get('conversation').id});
      msg.save(null, {
        success:function(conversation){
          self.model.set('conversation', conversation);
        },
        error:function(){
          console.log('err', arguments);
        }
      });
      return false;
    },

    _isMessageValid : function(msg){
      return msg.length > 0;
    },
    
    _onAddMessageInputFocus : function(event){
      this.$('.js-add-message-input').removeClass('error');
    }
    
  });
  
} ) ();