/*
 * Only routes for the standalone discussion roll.  The integrated view (for a logged-in user) is only shown when the user is
 * logged in and viewing from a full desktop browser.  That is handled through the DynamicRouter. (and doesn't exist yet)
 *
 */
libs.shelbyGT.StandaloneDiscussionRollRouter = Backbone.Router.extend({

  routes : {
    "mail/:discussionRollId"  : "_displayDiscussionRoll",
    "mail"                    : "_displayDiscussionRollsManager"
  },
  
  _displayDiscussionRoll : function(discussionRollId, params){
    // handle the "/mail/" route
    if(typeof(discussionRollId) === "undefined" || discussionRollId.length === 0){ 
      this._displayDiscussionRollsManager();
      return;
    }
    
    // handle the "/mail/:discussionRollId"
    var discussionRoll = new libs.shelbyGT.DiscussionRollModel({id:discussionRollId, token:params.t});
    
    shelby.views.standaloneDiscussionRoll = shelby.views.standaloneDiscussionRoll ||
        new libs.shelbyGT.StandaloneDiscussionRollView({model:discussionRoll, viewer:params.u, token:params.t});
  },
  
  /*
   * Want to show the manager which lets a signed-in user view all their discussionRolls.
   * Need some info about the signed in user tho.
   */
  _displayDiscussionRollsManager : function(){
    if (shelby.userSignedIn()){
      shelby.models.user.fetch({
        success: function(userModel, response) {
          shelby.views.standaloneDiscussionRoll = shelby.views.standaloneDiscussionRoll ||
              new libs.shelbyGT.StandaloneDiscussionRollView({viewer:userModel.id});
          shelby.views.standaloneDiscussionRoll.showDiscussionRollsManagerView();
        },
        error: function(){
          window.loation = "/";
        }
      });
    }
    else {
      window.location = "/";
    }
  }
  
});