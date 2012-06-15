(function(){
  console.log('activity monitor');
  var _interval = 3*1000; 
  var start = new Date().getTime();
  setInterval(function(){
    libs.utils.rhombus.sadd('active_web', shelby.models.user.id);
  }, _interval);
})();
