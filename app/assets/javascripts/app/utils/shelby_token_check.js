_(shelby).extend({
  userHasProvider : function(provider){
    // check if user has an authentication
    var hasProvider = false;
    $(shelby.models.user.get('authentications')).each(function(i,auth){
      if (auth.provider == provider) { hasProvider = true; }
    });
    return hasProvider;
  },

  checkFbTokenValidity : function(){
    var fbReauthDismissed = cookies.get('fb_reauth_dismissed');
    if (shelby.userHasProvider('facebook') && fbReauthDismissed != 'true'){
      // do ajax request to see if token is valid
      var _url = shelby.config.apiRoot + '/user/' +  shelby.models.user.id + '/is_token_valid?provider=facebook';
      var _fbAuth = shelby.config.apiBase + "/auth/facebook";
      $.ajax({ url:_url, xhrFields: {withCredentials: true} })
        .success(function(r){
          if (r.status == 200 && !r.result.token_valid){
            shelby.alert({
              message: "<p>In order to provide a great experience we need you to re-authenticate with facebook. Don't worry, you'll be re-directed back to Shelby. Yay!</p>",
              button_primary: {
                title: 'Re-authenticate Facebook'
                },
              button_secondary: {
                title: 'No thanks'
                }
              },
              function(returnVal){
                if(returnVal == libs.shelbyGT.notificationStateModel.ReturnValueButtonPrimary) {
                  document.location.href = _fbAuth;
                }

                cookies.set('fb_reauth_dismissed','true',90);
              }
            );
          }
        })
        .error(function(r){
          console.log("error checking fb credentials");
        });
    }
  }
});

