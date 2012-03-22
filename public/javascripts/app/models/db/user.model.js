libs.shelbyGT.UserModel = libs.shelbyGT.ShelbyBaseModel.extend({
  
  url : function() {
    return shelby.config.apiRoot + '/user/' + (this.isNew() ? '' : this.id);
  },

  getFirstName : function(){
    return this.get('name').split(' ')[0];
  }

});
