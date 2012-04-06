libs.shelbyGT.ShareModel = libs.shelbyGT.ShelbyBaseModel.extend({
  defaults : {
    destination:[],
    text:''
  },
  initialize : function(){
    this._buildNetworkSharingState(shelby.models.user);
    shelby.models.user.bind('change', this._onUserChange, this);
  },
  networkEnabled : function(network){
    var result = _.include(this.get('destination'), network);
    return result;
  },
  _onUserChange : function(user){
    this._buildNetworkSharingState(user);
  },
  _buildNetworkSharingState : function(user){
    var self = this;
    this.get('destination').length = 0;
    var authentications = user.get('authentications');
    if (authentications) {
      authentications.forEach(function(auth){
        self.get('destination').push(auth.provider);
      });
    }
  }
});
