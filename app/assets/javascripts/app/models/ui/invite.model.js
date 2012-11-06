libs.shelbyGT.InviteModel = libs.shelbyGT.ShelbyBaseModel.extend({
  defaults : {
    to : '',
    body : shelby.config.email.invite.defaultMessage
  },

  url : function() {
    return shelby.config.apiRoot + '/beta_invite';
  }
});