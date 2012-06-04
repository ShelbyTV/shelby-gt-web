(function(){
  libs.utils.email = {
    
    publishCurrentFrame : function(){
      libs.utils.email.sendRollNotification(shelby.models.guide.get('activeFrameModel'));
    },
    
    // this fn needs to be called and passed the 'just rolled' frame -- how do we get a ref to that?
    sendRollNotification : function(frame){
      if (window.location.host.indexOf('localhost')===-1) return;
      console.log(frame);
      jQuery.ajax({
        type : 'POST',
        url : 'http://localhost:4000/roll/'+frame.get('roll').id+'/publish',
        data : {
          title : frame.get('video').get('title'),
          user : shelby.models.user.get('name'),
          frame_id : frame.id
        },
        error : function(){
          console.log('oh no error', arguments);
        },
        success : function(){
          console.log('suc', arguments);
        }
      });
    }
  };
})();
