libs.shelbyGT.OnboardingConnectServicesViewModel = Backbone.Model.extend({

  defaults: {
    action : 'connect',   // acceptable values are:
                          // 'connect' - choose a service to connect,
                          // 'load' - load videos from the selected service,
                          // 'invite' - invite friends from the selected service to Shelby
    service : 'facebook',  // 'facebook' or 'twitter'
    numFriends : null, // the number of friends we've found for the user on the current service
    numVideos : null, // the number of videos we've found for the user on the current service
    authFailure : false
  }

});
