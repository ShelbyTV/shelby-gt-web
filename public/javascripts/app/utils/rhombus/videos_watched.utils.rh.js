(function(){
  var login_data_sent = false;
  $(document).ready(function(){
    shelby.models.guide.bind('change:activeFrameModel', function(guide, frame){
      libs.utils.rhombus.sadd('videos_watched', frame.get('video').id);
    });
  });

})();
