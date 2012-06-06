(function(){
  libs.utils.email = {

    apiRoot : window.location.host.indexOf('localhost')===-1 ? 'http://50.57.150.47:4000' : 'http://localhost:4000',
    
    publishCurrentFrame : function(){
      libs.utils.email.sendRollNotification(shelby.models.guide.get('activeFrameModel'));
    },
    
    // this fn needs to be called and passed the 'just rolled' frame -- how do we get a ref to that?
    publishFrameAddition : function(frame){
      return;
      var self = this;
      // don't publish if we're in localhost
      if (window.location.host.indexOf('localhost')!==-1) return;
      console.log('here');
      jQuery.ajax({
        type : 'POST',
        url : self.apiRoot+'/roll/'+frame.get('roll_id')+'/publish',
        data : {
          title : frame.get('video').get('title'),
          roll_title : frame.get('roll').get('title'),
          // comment : don't have this yet! : (
          user : shelby.models.user.get('name'),
          frame_id : frame.id
        },
        error : function(){
          console.log('oh no error', arguments);
        },
        success : function(){
          //do nothing
        }
      });
    }
  };
})();
