libs.shelbyGT.AnonUserModel = libs.shelbyGT.UserModel.extend({
  defaults : {
      additional_abilities : [],
      anon : true,
      app_progress : new libs.shelbyGT.AppProgressModel(),
      authentications : [],
      autocomplete : {},
      csrf_token : '',
      faux : 1,
      id : '',
      nickname : 'anonymous',
      preferences : {
        email_updates : false,
        like_notifications : false,
        quiet_mode : null,
        watched_notifications : false
      },
      primary_email : null,
      user_image: "",
      user_image_original: "",
      watch_later_roll : {
        id : 'anon'
      },
      personal_roll : {
        id : 'anon'
      }
  },
  getRollFollowings : function(){
    return [{
      //@vimeo
      id : "4f900cf5b415cc466a0005bb"
    }];
  }
});
