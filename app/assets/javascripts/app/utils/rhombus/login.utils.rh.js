libs.utils.rhombus = _.extend({},libs.utils.rhombus,{
  login : {

    _login_data_sent : false,

    init_login : function(){
      shelby.models.user.bind('change', function(user){
        !this._login_data_sent && libs.utils.rhombus.sadd('web_logins', user.id);
        this._login_data_sent = true;
      }, this);
    }

  }
});