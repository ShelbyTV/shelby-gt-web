libs.shelbyGT.StandaloneDiscussionRollView = Support.CompositeView.extend({
  
  //TODO: this probably changes
  el: '#js-shelby-wrapper',
  
  initialize : function(){
    this._hackPrepareDOM();    
    this.render();
  },
  
  template : function(obj){
    return SHELBYJST['discussion-roll/standalone-layout'](obj);
  },
  
  render : function(){
    this.$el.html(this.template());
    
    this.renderChild(new libs.shelbyGT.DiscussionRollRecipientsView({model:this.model, viewer:this.options.viewer}));
    this.renderChild(new libs.shelbyGT.DiscussionRollConversationView({model:this.model}));
    this.renderChild(new libs.shelbyGT.DiscussionRollReplyView({model:this.model, token:this.options.token}));
  },
  
  //XXX don't actualy want to do this in production
  //    what we should do: have the wrapper empty in app.html
  //    and load a top-level layout view into it from the router
  //    MM will have input there
  _hackPrepareDOM : function(){
    //TODO: should just display different layout for entire page; quick & dirty hack for now...
    $("#js-shelby-wrapper").empty();
    $("#js-shelby-wrapper").css("color","white");
  }
  
});