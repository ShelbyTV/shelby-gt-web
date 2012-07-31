libs.utils.rhombus = _.extend({},libs.utils.rhombus,{
  videos_watched : {
    init_videos_watched : function(){
      shelby.models.guide.bind('change:activeFrameModel', function(guide, frame){
        libs.utils.rhombus.sadd('videos_watched', frame.get('video').id);
      });
    }
  }
});