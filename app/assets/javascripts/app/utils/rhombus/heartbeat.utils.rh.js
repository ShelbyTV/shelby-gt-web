(function(){

  var start_time = new Date().getTime()
  , heartbeat_interval = 10000; // 10 seconds

  var heartbeat = function(){
    libs.utils.rhombus._post({
      cmd : 'hset',
      t : start_time, //this anchors us in the key that the session was started in
      args : ['session_length', shelby.models.user.id, new Date().getTime() - start_time],
    });
  };

  setInterval(heartbeat, heartbeat_interval);

})();
