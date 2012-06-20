libs.shelbyGT.RollOverlayContextView = Support.CompositeView.extend({

  template : function(obj){
    return JST['overlay-context'](obj);
  },

  render : function(){
    var first_frame_thumbnail = null;
    if( this.model.get('frames') && this.model.get('frames').length > 0 && this.model.get('frames').first().get('video') ){
     first_frame_thumbnail = this.model.get('frames').first().get('video').get('thumbnail_url');
    }

    this.$el.html(this.template({
      thumbnail : first_frame_thumbnail,
      creatorName : this.model.get('creator_nickname'),
      title : this.model.get('title')
    }));
  }

});
