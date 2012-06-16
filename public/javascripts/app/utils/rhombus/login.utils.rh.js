(function(){
  var login_data_sent = false;
  $(document).ready(function(){
    shelby.models.user.bind('change', function(user){
      !login_data_sent && libs.utils.rhombus.sadd('web_logins', user.id);
      login_data_sent = true;
    });
  });

})();
