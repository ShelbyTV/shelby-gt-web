(function(){

  var _interval = 3*60*1000; //3 mins
  setTimeout(function(){
    libs.utils.rhombus.sadd('active_web', shelby.models.user.id);
  }, _interval);

})();
