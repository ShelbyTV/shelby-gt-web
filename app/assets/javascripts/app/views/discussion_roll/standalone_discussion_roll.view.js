libs.shelbyGT.StandaloneDiscussionRollView = Support.CompositeView.extend({
  
  el: '#js-shelby-wrapper',
  
  initialize : function(){
    //TODO: ideally, the styles applied to 'shelby-wrapper--discussion' should be applied to like... the body -MM
    $('body').addClass('shelby-wrapper--discussion');
    
    this.render();
    
    //fetch the discussion roll, which all my children are watching
    this.model.fetch({
      success: function(model, resp){
        setTimeout(function(){ $("body").scrollTop(10000000000); }, 100);
      },
      error: function(a){
        $(".js-discussion-roll-conversation-list").html("<h1>Something went wrong :(</h1><h1>Try reloading...</h1>")
      }
    });

  },
  
  template : function(obj){
    return SHELBYJST['discussion-roll/standalone-layout'](obj);
  },
  
  render : function(){
    this.$el.html(this.template());
    
    var opts = {model:this.model, viewer:this.options.viewer, token:this.options.token};
    
    this.renderChild(     new libs.shelbyGT.DiscussionRollRecipientsView(opts));
    this.appendChildInto( new libs.shelbyGT.DiscussionRollConversationView(opts), 
      ".js-discussion-roll-conversation-wrapper");
    this.renderChild(     new libs.shelbyGT.DiscussionRollReplyView(opts));
  }
  
});