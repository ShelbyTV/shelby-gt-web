libs.utils.Time = {
  
  HMStoS : function(hours, minutes, seconds){
    return (hours * 60 * 60) + (minutes * 60) + seconds;
  },

  StoHMS : function(seconds){
    return {
      hours : parseInt(seconds / (60*60), 10 ) % 60,
      minutes : parseInt(seconds / 60, 10 ) % 60,
      seconds : parseInt(seconds % 60, 10)
    };
  }

 };