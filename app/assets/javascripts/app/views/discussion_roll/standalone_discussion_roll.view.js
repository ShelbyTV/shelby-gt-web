libs.shelbyGT.StandaloneDiscussionRollView = Support.CompositeView.extend({
  
  //TODO: this probably changes
  el: '#js-shelby-wrapper',
  
  initialize : function(){
    var self = this;

    console.log("Standlone Discussion View initialized for roll:", this.options.discussionRoll);
    
    this.prepareDOM();
    
    this.render();
  },
  
  template : function(obj){
    return SHELBYJST['discussion-roll/standalone-layout'](obj);
  },
  
  render : function(){
    this.$el.html(this.template());
    
    this.renderChild(new libs.shelbyGT.DiscussionRollRecipientsView({roll:this.options.discussionRoll}));
    this.renderChild(new libs.shelbyGT.DiscussionRollConversationView({roll:this.options.discussionRoll}));
    this.renderChild(new libs.shelbyGT.DiscussionRollReplyView({roll:this.options.discussionRoll}));
  },
  
  //XXX don't actualy want to do this in production
  //    what we should do: have the wrapper empty in app.html
  //    and load a top-level layout view into it from the router
  //    MM will have input there
  prepareDOM : function(){
    //TODO: get the DOM ready by hiding something, adding something
    //in the future, may just change the layout of the overall page, this is fine for now
    $("#js-shelby-wrapper").empty();
  }
  
});