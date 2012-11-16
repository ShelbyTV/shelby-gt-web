/*
 * Only routes for the standalone discussion roll.  The integrated view (for a logged-in user) is only shown when the user is
 * logged in and viewing from a full desktop browser.  That is handled through the DynamicRouter.
 *
 */
libs.shelbyGT.StandaloneDiscussionRollRouter = Backbone.Router.extend({

  routes : {
    "chat/:discussionRollId" : "displayDiscussionRoll"
  },
  
  displayDiscussionRoll : function(discussionRollId, params){
    var discussionRoll = new libs.shelbyGT.DiscussionRollModel({id:discussionRollId, token:params.t});
    
    shelby.views.standaloneDiscussionRoll = shelby.views.standaloneDiscussionRoll ||
        new libs.shelbyGT.StandaloneDiscussionRollView({model:discussionRoll, viewer:params.u, token:params.t});
        
    discussionRoll.fetch({
      error: function(a){
        //TODO: display error to user
        console.log("ERROR on fetch of discussion roll. ", a);
      }
    });
  }
  
});