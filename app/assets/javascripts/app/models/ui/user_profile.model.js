libs.shelbyGT.UserProfileModel = Backbone.Model.extend({

  // catalog of events
  // 'playRoll:<<rollId>>' - signal that the playing roll on the user profile should be changed to the roll with rollId
  // <<rollId>> is replaced by the actual id of the roll in question

  defaults : {
    autoLoadRollId : null, // the roll to start playing from on load - if null will be the user's personal roll
    autoLoadFrameId : null, // the frame to start playing from on load - if null will be the first frame on the roll
    currentUser : null
  }

});
