libs.shelbyGT.UserProfileModel = Backbone.Model.extend({

  defaults : {
    autoLoadRollId : null, // the roll to start playing from on load - if null will be the user's personal roll
    autoLoadFrameId : null, // the frame to start playing from on load - if null will be the first frame on the roll
    currentUser : null
  }

});
