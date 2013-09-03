libs.utils.intercom = {
  santizeOnboarding: function(onboarding){
    if (onboarding === false) {
      return 0;
    } else if (onboarding === true) {
      return 99;
    } else {
      return onboarding;
    }
  },

  send : function(action, userModel){
    var self = this;
    if(typeof(Intercom) !== "undefined"){
      try {
        created_at = new Date(userModel.get('created_at'));
        created_at = created_at.getTime()/1000;
        should_send_emails = userModel.get('preferences')['email_updates'];
        Intercom(action, {
                app_id: 'aeb096feb787399ac1cf3985f891d0e13aa47571',
                email: userModel.get('primary_email'),
                created_at: created_at,
                name: userModel.get('name'),
                user_id: userModel.get('id'),
                unsubscribed_from_emails : should_send_emails,
                onboardingProgress: self.santizeOnboarding(shelby.models.user.get('app_progress').get('onboarding')),
                tv_page: "http://shelby.tv/"+userModel.get('personal_roll_subdomain')
              });
      } catch (e) {console.log("[ INTERCOM ERROR ] ", e);}
    }
  }
};
