libs.utils.userNotifications = {
  init : function(user){

    // var newlyRolledVideos = user.rolled_since_last_notification.email || 1;
    var newlyRolledVideos = 14;

    if(newlyRolledVideos > 0) {
      var opts = {
        message: "<p>You've rolled " + ((newlyRolledVideos == 1) ? 'a new Video' : newlyRolledVideos + ' new Videos') + " via Email</p>",
        button_primary : {
          title: 'Go to Roll'
        },
        button_secondary : {
          title: 'Dismiss'
        }
      };

      shelby.dialog(opts, function(returnVal){
        console.log(this, user);
        if (returnVal == libs.shelbyGT.notificationStateModel.ReturnValueButtonPrimary) {
          //primary button clicked
          shelby.router.navigate('roll/' + user.get('personal_roll_id'), {trigger: true});
        } else {
          //not the primary button clicked
          //do nothing, just dismiss
        }


        // user.save({})
      });
    }

  }
};