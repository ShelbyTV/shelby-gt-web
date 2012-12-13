// Enable pusher logging - don't include this in production
if (shelby.config.environment == "development"){
  Pusher.log = function(message) {
    if (window.console && window.console.log) window.console.log(message);
  };

  // Flash fallback logging - don't include this in production
  WEB_SOCKET_DEBUG = true;  
}