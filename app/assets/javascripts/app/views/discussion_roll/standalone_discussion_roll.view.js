libs.shelbyGT.StandaloneDiscussionRollView = Support.CompositeView.extend({
  
  //TODO: this probably changes
  el: '#js-shelby-wrapper',
  
  initialize : function(){
    this._hackPrepareDOM();
    this.render();
    
    //fetch the discussion roll
    this.model.fetch({
      success: function(model, resp){
        setTimeout(function(){ $("body").scrollTop(10000000000); }, 100);
      },
      error: function(a){
        //TODO: display error to user
        console.log("ERROR on fetch of discussion roll. ", a);
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
  },
  
  //XXX don't actualy want to do this in production
  //    what we should do: have the wrapper empty in app.html
  //    and load a top-level layout view into it from the router
  //    MM will have input there
  _hackPrepareDOM : function(){
    //TODO: should just display different layout for entire page; quick & dirty hack for now...
    $("#js-shelby-wrapper").empty();
    $('body').addClass('shelby-wrapper--discussion');
    //ideally, the styles applied to 'shelby-wrapper--discussion' should be applied to like.. the body
  }
  
});