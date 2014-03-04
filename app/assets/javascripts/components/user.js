$(function(){
  Shelby.UserModel = Backbone.Model.extend({
    defaults : {
      nickname: Shelby.libs.User.anonymous.nickname,
      user_type: Shelby.libs.User.user_types.anonymous
    },
    is_user_type : function(userType){
      return this.get('user_type') == userType;
    },
    is_anonymous : function(){
      return this.get('nickname') == Shelby.libs.User.anonymous.nickname;
    },
    updateAppProgress : function(app_progress_key,app_progress_value){
      this.get('app_progress')[app_progress_key] = app_progress_value;

      $.ajax({
        type: 'GET',
        url: Shelby.apiRoot + "/PUT/user/" + this.get('id'),
        dataType: "jsonp",
        timeout: 10000,
        crossDomain: true,
        data: {
          'app_progress': this.get('app_progress')
        },
        xhrFields: {
          withCredentials: true
        },
        success: function(e){
          console.log('user update success: ',e);
        },
        error: function(e){
          console.log('user update fail: ',e);
        }
      });
    }
  });

  Shelby.User = new Shelby.UserModel(JSON.parse($('#js-user').html()));
});
