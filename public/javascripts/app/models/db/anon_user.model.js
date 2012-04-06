libs.shelbyGT.AnonUserModel = libs.shelbyGT.UserModel.extend({
  defaults : function(){
    return {
      anon : true,
      authentications : [],
      csrf_token : '',
      faux : 0,
      id : '',
      nickname : 'anonymous',
      preferences : this._getPreferences(),
      roll_followings : this._getRollFollowings(),
      primary_email : null,
      user_image: "",
      user_image_original: "",
      watch_later_roll : {
        id : 'anon'
      },
      public_roll : {
        id : 'anon'
      }
    };
  },
  _getRollFollowings : function(){
    return [{
      id : "4f689ff1b415cc368c000006"
    }]
  },
  _getPreferences : function(){
    return {
      email_updates : false,
      like_notifications : false,
      quiet_mode : null,
      watched_notifications : false 
    }
  }
});
