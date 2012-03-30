libs.shelbyGT.ShareModel = libs.shelbyGT.ShelbyBaseModel.extend({
  defaults : {
    destination:[]
  },
  url : function(){
    return shelby.config.apiRoot + '/roll/'+shelby.models.guide.get('contentPaneModel').id+'/share';
  },
  initialize : function(){
    shelby.models.user.bind('change', this._onUserChange, this);  
  },
  networkEnabled : function(network){
    var result = _.include(this.get('destination'), network);
    return result;
  },
  _onUserChange : function(user){
    this._buildNetworkSharingState(user.get('authentications'));
  },
  _buildNetworkSharingState : function(authentications){
    var self = this;
    authentications.forEach(function(auth){
      self.get('destination').push(auth.provider);
    });
  }
});
