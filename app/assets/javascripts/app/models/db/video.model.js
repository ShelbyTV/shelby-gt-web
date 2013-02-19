libs.shelbyGT.VideoModel = libs.shelbyGT.ShelbyBaseModel.extend({

  markUnplayable : function(){
    // save this model and have it self-update on return
    // not using the standard save route for unplayable
    this.save({}, {
      url : shelby.config.apiRoot + '/video/'+this.id+'/unplayable'
    });
  },

  canPlayMobile : function(){
    return _(shelby.config.video.mobileSupportedProviders).contains(this.get('provider_name'));
  }

});
