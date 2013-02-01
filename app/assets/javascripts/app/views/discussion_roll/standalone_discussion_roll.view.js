libs.shelbyGT.StandaloneDiscussionRollView = Support.CompositeView.extend({
  
  events : {
    "click .js-nav" : "showDiscussionRollsManagerView",
  },
  
  el: '#js-shelby-wrapper',
  
  initialize : function(){
    //TODO: ideally, the styles applied to 'shelby-wrapper--discussion' should be applied to like... the body -MM
    $('body').addClass('shelby-wrapper--discussion');
    
    this.model && this.model.on('change:discussion_roll_participants', this._updateRecipientsViews, this);
    
    this.render();
    
    //fetch the discussion roll, which all my children are watching
    this.model && this.model.fetch({
      success: function(model, resp){
        setTimeout(function(){ $("body").scrollTop(10000000000); }, 100);
      },
      error: function(a){
        $(".js-discussion-roll-conversation-list").html("<h1>Something went wrong :(</h1><h1>Try reloading...</h1>");
      }
    });

  },
  
  _cleanup: function(){
    this.model && this.model.off('change:discussion_roll_participants', this._updateRecipientsViews, this);
  },
  
  template : function(obj){
    return SHELBYJST['discussion-roll/standalone-layout'](obj);
  },
  
  render : function(){
    this.$el.html(this.template());
    
    var opts = {model:this.model, viewer:this.options.viewer, token:this.options.token};
    
    if(this.options.viewer){
      //manager only needs viewr
      this.renderChild(new libs.shelbyGT.DiscussionRollsManagerView(_.extend({delegate:this}, opts)));
      
      //recipients, conversation, reply require a discusison roll (ie.this.model) and token
      if(this.model && this.options.token){
        this._updateRecipientsViews();
        this.appendChildInto( new libs.shelbyGT.DiscussionRollConversationView(opts), 
          ".js-discussion-roll-conversation-wrapper");
        this.renderChild(     new libs.shelbyGT.DiscussionRollReplyView(opts));
      }
    }
  },
  
  showDiscussionRollsManagerView: function(e){
    e && e.stopPropagation();
    
    this._scrollTopWhenHidden = $("body").scrollTop();
    $(".js-discussion").addClass('discussions-manager-shown');
    $('.discussion__content--manager').show();
    $("body").scrollTop(0);
  },
  
  discussionRollsManagerViewShouldDisappear: function(){
    $('.discussion__content--manager').hide();
    $(".js-discussion").removeClass('discussions-manager-shown');
    $("body").scrollTop(this._scrollTopWhenHidden);
  },
  
  //show single recipient in nav title, or should group in supplementary TO area
  _updateRecipientsViews: function(){
    var self = this;
    
    if(this.options.viewer && this.model && this.model.has('discussion_roll_participants')){
      
      switch(this.model.get('discussion_roll_participants').length){
        case 1:
          //viewer is only participant in conversation
          this._setTitleFor(this.options.viewer);
          break;
        case 2:
          //conversation is with the other participant that isn't viewer
          this._setTitleFor(_.find(this.model.get('discussion_roll_participants'), function(p){ return p !== self.options.viewer; } ));
          break;
        default:
          //group conversation, shown in supplementar TO element
          this.renderChildInto( new libs.shelbyGT.DiscussionRollRecipientsView(
                                  _.extend({updatePageTitle:true}, 
                                  {model:this.model, viewer:this.options.viewer, token:this.options.token})),
                                this.$(".js-discussion-roll-recipients"));
          this.$('.js-nav-title').text('Group Conversation');
      }

    }
  },
  
  //set the nav title for a non-group conversation
  _setTitleFor: function(idOrEmail){
    var self = this;
    
    if(idOrEmail.indexOf("@") === -1){
      //need to fetch user's info and set it in title
      var user = new libs.shelbyGT.UserModel({id: idOrEmail});
      user.fetch({
        success: function(userModel, resp){
          self.$('.js-nav-title').text(userModel.get('nickname'));
        }
      });
    } else {
      this.$('.js-nav-title').text(idOrEmail);
    }
    
    this.$(".js-discussion-roll-recipients").hide();
  }
  
});