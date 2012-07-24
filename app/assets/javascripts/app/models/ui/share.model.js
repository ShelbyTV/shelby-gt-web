( function(){

  // the API may pass us authenticated networks/services in the user model that it doesn't yet
  // support for sharing, so here we list all networks currently supported for sharing and exclude
  // the others
  var supportedDestinations = ['twitter', 'facebook', 'email'];

  libs.shelbyGT.ShareModel = libs.shelbyGT.ShelbyBaseModel.extend({
    defaults : {
      destination:[],
      text:'',
      addresses:''
    },
    initialize : function(){
      this._buildNetworkSharingState(shelby.models.user);
      shelby.models.user.bind('change:authentications', this._onUserChange, this);
    },
    sync : function(method, model, options) {
      // the share model is not persisted to the database directly, so there
      // is no such thing as an update or delete for this model
      if (method == 'update' || method == 'delete') {
        method = 'create';
      }
      return libs.shelbyGT.ShelbyBaseModel.prototype.sync.call(this, method, model, options);
    },
    save: function(key, value, options) {
      libs.shelbyGT.ShelbyBaseModel.prototype.save.call(this, key, value, options);
      // if this share contained email addresses, save them for autocomplete
      if (_(this.get('destination')).contains('email')) {
        shelby.models.user.push_autocomplete_entries('email', this.get('addresses'));
      }
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
        var destinations = _(authentications).chain().pluck('provider').intersection(supportedDestinations).value();
        this.set('destination', destinations);
      }
      
    }
  });

} ) ();