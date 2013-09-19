libs.shelbyGT.VideoModel = libs.shelbyGT.ShelbyBaseModel.extend({

  watched : function(completeWatch, startTime, endTime, onSuccess) {
    var url = shelby.config.apiRoot + '/video/' + this.id + '/watched';
    if(completeWatch){
      url += "?complete=1";
    } else if(typeof startTime != "undefined" && typeof endTime != "undefined"){
      url += '?start_time='+startTime+'&end_time='+endTime;
    }
    this.save(null, {url:url, success:onSuccess});
  },

  markUnplayable : function(){
    // save this model and have it self-update on return
    // not using the standard save route for unplayable
    this.save({}, {
      url : shelby.config.apiRoot+'/video/'+this.id+'/unplayable'
    });
  },

  canPlayMobile : function(){
    return _(shelby.config.video.mobileSupportedProviders).contains(this.get('provider_name'));
  },

  checkRequestDbFix : function(){
    // if any of the key video attributes are missing,
    // fire a request that the video be fixed, so future users won't have problems
    if (!this.attributes.title ||
        !this.attributes.thumbnail_url ||
        !this.attributes.embed_url) {
      // ignore the response, this is only to fix the video for the future
      $.ajax({
        type : 'PUT',
        url : shelby.config.apiRoot+'/video/'+this.id+'/fix_if_necessary'
      });
    }
  },

  // returns a boolean specifying whether the video passed in is the same as this video
  isSameVideo : function(video) {
    return (this.id == video.id ||
            (this.get('provider_id') == video.get('provider_id') && this.get('provider_name') == video.get('provider_name'))
           );
  }

});
