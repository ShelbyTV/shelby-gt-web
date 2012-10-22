libs.shelbyGT.InviteModel = libs.shelbyGT.ShelbyBaseModel.extend({
  defaults : {
    to:'',
    body:"Check out Shelby.tv!  It's a simple new way to explore video."
  },

  url : function() {
    return shelby.config.apiRoot + '/invites';
  }
});