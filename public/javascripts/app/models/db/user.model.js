libs.shelbyGT.UserModel = libs.shelbyGT.ShelbyBaseModel.extend({
  
  url : function() {
    return shelby.config.apiRoot + '/user/' + (this.isNew() ? '' : this.id);
  }

});
