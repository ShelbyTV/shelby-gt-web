// Enable pusher logging - don't include this in production
if (shelby.config.environment == "development"){
  Pusher.log = function(message) {
    if (window.console && window.console.log) window.console.log(message);
  };

  // Flash fallback logging - don't include this in production
  WEB_SOCKET_DEBUG = true;  
}

$('document').ready(function(){
  var pusher = new Pusher(shelby.config.pusher_key);

  // get remote control code
  $.post(shelby.config.apiRoot+'/remote_control', function(r){
    if (r.status == 200){
      // print url
      console.log("[SHELBY] Remote Control URL : ", r.result.url)
      // subscribe to correct channel
      var channel = pusher.subscribe('remote-'+r.result.code);
      
      channel.bind('up', function(data) {
        console.log('command received: up', data);
        shelby.models.userDesires.triggerTransientChange('changeChannel', 1);
      });
      channel.bind('down', function(data) {
        console.log('command received: down', data);
        shelby.models.userDesires.triggerTransientChange('changeChannel', -1);
      });
      channel.bind('left', function(data) {
        console.log('command received: left', data);
        shelby.models.userDesires.triggerTransientChange('changeVideo', -1);
      });
      channel.bind('right', function(data) {
        console.log('command received: right', data);
        shelby.models.userDesires.triggerTransientChange('changeVideo', 1);
      });
      channel.bind('enter', function(data) {
        console.log('command received: enter', data);
        var activePlayerState = shelby.models.playbackState.get('activePlayerState');
        if (activePlayerState) {
          var _newPlaybackStatus = (activePlayerState.get('playbackStatus')===libs.shelbyGT.PlaybackStatus.playing) ? libs.shelbyGT.PlaybackStatus.paused : libs.shelbyGT.PlaybackStatus.playing;
          shelby.models.userDesires.triggerTransientChange('playbackStatus', _newPlaybackStatus);
        }
      });
    }
  })
})
