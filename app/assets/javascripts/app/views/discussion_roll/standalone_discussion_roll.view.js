libs.shelbyGT.StandaloneDiscussionRollView = Support.CompositeView.extend({
  
  events : {
    "click .js-nav" : "showDiscussionRollsManagerView",
  },
  
  el: '#js-shelby-wrapper',
  
  initialize : function(){
    //TODO: ideally, the styles applied to 'shelby-wrapper--discussion' should be applied to like... the body -MM
    $('body').addClass('shelby-wrapper--discussion');
    
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
        this.renderChildInto( new libs.shelbyGT.DiscussionRollRecipientsView(_.extend({updatePageTitle:true}, opts)),
          this.$(".js-discussion-roll-recipients"));
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
  
});