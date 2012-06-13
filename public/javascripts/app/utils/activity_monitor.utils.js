(function(){
  var _interval = 2*60*1000; 
  var start = new Date().getTime();
  setTimeout(function(){
    libs.utils.rhombus.sadd('active', shelby.models.user.id);
  }, _interval);
})();
