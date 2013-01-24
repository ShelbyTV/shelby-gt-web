( function(){

  // shorten names of included library prototypes
  var GuideOverlayView = libs.shelbyGT.GuideOverlayView;
  var MessageModel = libs.shelbyGT.MessageModel;
  var MessageView = libs.shelbyGT.MessageView;
  var ShelbyAutocompleteView = libs.shelbyGT.ShelbyAutocompleteView;

  libs.shelbyGT.FrameConversationView = GuideOverlayView.extend({

    events : _.extend({}, GuideOverlayView.prototype.events, {
      "click .js-cancel:not(.js-busy)" : "_setGuideOverlayStateNone",
      "click .js-new-comment-submit"   : "_addMessage",
      "click .js-message-reply"        : "_reply",
      "click .js-load-video"           : "_loadVideo",
      "click #js-login-within-comments": "_showLogin"
    }),

    className : GuideOverlayView.prototype.className + ' guide-overlay--conversation',

    template : function(obj){
      return SHELBYJST['frame-conversation'](obj);
    },

    initialize : function(){
      this.model.get('conversation').on('change', this._onConversationChange, this);
    },

    _cleanup : function(){
      this.model.get('conversation').off('change', this._onConversationChange, this);
    },

    render : function(){
      var self = this;

      this.$el.html(this.template({ frame : this.model, user: shelby.models.user }));

      this.model.get('conversation').get('messages').each(function(message){
        var messageView = new MessageView({model:message});
        self.renderChild(messageView);
        self.$('.js-conversation__list').append(messageView.el);
      });

      if (this._shelbyAutocompleteView) {
        this._shelbyAutocompleteView.leave();
      }
      this._shelbyAutocompleteView = new ShelbyAutocompleteView({
        el : this.$('.js-add-message-input')[0],
        includeSources : ['shelby'],
        multiTerm : true,
        multiTermMethod : 'paragraph',
        shelbySource : function() {
          return _(self.model.get('conversation').get('messages').pluck('nickname')).uniq();
        }
      });
      this.renderChild(this._shelbyAutocompleteView);

      GuideOverlayView.prototype.render.call(this);
    },

    _onConversationChange : function(){
      this.render(true);
    },

    _renderError : function(msg){
      this.$('.js-add-message-input').addClass('error');
      return false;
    },

    _reply : function(e){
      e.preventDefault();
      var replyTo = $(e.currentTarget).data('reply_to');
      var $messageInput = this.$('.js-add-message-input');
      $messageInput.val('@'+replyTo+' ').focus();
      $messageInput.setSelection($messageInput.val().length);
    },

    _addMessage : function(){
      var self = this;
      var text = this.$('.js-add-message-input').val();

      if (!this._isMessageValid(text)) {
        this._renderError('Why not say something?');
        return false;
      }
      var msg = new MessageModel({text:text, conversation_id:this.model.get('conversation').id});
      msg.save(null, {
        success:function(conversation){
          self.model.set('conversation', conversation);
        },
        error:function(){
          console.log('err', arguments);
        }
      });
      libs.utils.rhombus.sadd('comments', this.model.id);

      shelby.track('commented', {id: this.model.id.toString(), userName: shelby.models.user.get('nickname')});

      return false;
    },

    _isMessageValid : function(msg){
      return msg.length > 0;
    },

    _onAddMessageInputFocus : function(event){
      this.$('.js-add-message-input').removeClass('error');
    },

    _loadVideo : function(){
      shelby.models.guide.set('activeFrameModel', this.model);
    },

    _showLogin : function(){
      this.$el.find('.signup-section-lining').html(SHELBYJST['signin-form']());
      $('.signup-section').css("left","10px").css('top','38px');
      $('.dropdown_section').toggle();
      $('.form_fieldset.social_login.login-social-section, hr').hide();
      $('.conversation-body').scrollTop($('.conversation-body').scrollTop()+$('.signup-section').height());
    }

  });

} ) ();
