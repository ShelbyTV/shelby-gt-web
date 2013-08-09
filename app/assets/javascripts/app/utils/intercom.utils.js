libs.utils.intercom = {
  boot : function(userModel){
    if(typeof(Intercom) !== "undefined"){
      try {
        created_at = new Date(userModel.get('created_at').slice(0,10));
        created_at = created_at.getTime()/1000;
        should_send_emails = userModel.get('preferences')['email_updates'];
        Intercom('boot', {
                app_id: 'aeb096feb787399ac1cf3985f891d0e13aa47571',
                email: userModel.get('primary_email'),
                created_at: created_at,
                name: userModel.get('name'),
                user_id: userModel.get('id'),
                unsubscribed_from_emails : should_send_emails,
                onboarding_progress: userModel.get('app_progress').get('onboarding'),
                tv_page: "http://shelby.tv/"+userModel.get('personal_roll_subdomain')
              });
      } catch (e) {console.log("[ INTERCOM ERROR ] ", e);}
    }
  }
};
