libs.shelbyGT.VideoModel = libs.shelbyGT.ShelbyBaseModel.extend({

  url : function() {
    return shelby.config.apiRoot + '/video/' + this.id;
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
  }

});
