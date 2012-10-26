libs.shelbyGT.InviteModel = libs.shelbyGT.ShelbyBaseModel.extend({
  defaults : {
    to : '',
    body : "It's a simple way to discover new video, and share your own taste at a personal .tv site."
  },

  url : function() {
    return shelby.config.apiRoot + '/beta_invite';
  }
});