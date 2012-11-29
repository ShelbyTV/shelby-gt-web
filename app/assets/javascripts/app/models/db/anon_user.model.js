libs.shelbyGT.AnonUserModel = libs.shelbyGT.UserModel.extend({
  defaults : function(){
    return {
      additional_abilities : [],
      anon : true,
      app_progress : new libs.shelbyGT.AppProgressModel(),
      authentications : [],
      autocomplete : {},
      csrf_token : '',
      faux : 1,
      id : '',
      nickname : 'anonymous',
      preferences : this._getPreferences(),
      primary_email : null,
      user_image: "",
      user_image_original: "",
      watch_later_roll : {
        id : 'anon'
      },
      personal_roll : {
        id : 'anon'
      }
    };
  },
  getRollFollowings : function(){
    return [{
      //@vimeo
      id : "4f900cf5b415cc466a0005bb"
    }];
  },
  _getPreferences : function(){
    return {
      email_updates : false,
      like_notifications : false,
      quiet_mode : null,
      watched_notifications : false
    };
  }
});
