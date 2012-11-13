/*
 * Only routes for the standalone discussion roll.  The integrated view (for a logged-in user) is only shown when the user is
 * logged in and viewing from a full desktop browser.  That is handled through the DynamicRouter.
 *
 */
libs.shelbyGT.StandaloneDiscussionRollRouter = Backbone.Router.extend({

  routes : {
    "discussion/roll/:discussionRollId"                          : "displayDiscussionRoll"
  },
  
  displayDiscussionRoll : function(discussionRollId, params){
    var discussionRoll = new libs.shelbyGT.DiscussionRollModel({id:discussionRollId, token:params.t});
    
    shelby.views.standaloneDiscussionRoll = shelby.views.standaloneDiscussionRoll ||
        new libs.shelbyGT.StandaloneDiscussionRollView({discussionRoll:discussionRoll});
        
    //TODO: do i need any success/error handlers?  Or can this just be entirely handled by the BINDINGS of subviews?
    discussionRoll.fetch({
      success: function(userModel, response) {
        console.log("FETCHED discussion roll successfully. ", userModel, response);
      },
      error: function(a){
        console.log("ERROR on fetch of discussion roll. ", a);
      }
    });
  }
  
});