$(function(){
  Shelby.UserModel = Backbone.Model.extend({
    defaults : {
      nickname: Shelby.libs.User.anonymous.nickname,
      user_type: Shelby.libs.User.user_types.anonymous
    },
    is_user_type: function(userType){
      return this.get('user_type') == userType;
    },
    is_anonymous : function(){
      return this.get('nickname') == Shelby.libs.User.anonymous.nickname;
    }
  });

  Shelby.User = new Shelby.UserModel(JSON.parse($('#js-user').html()));
});
