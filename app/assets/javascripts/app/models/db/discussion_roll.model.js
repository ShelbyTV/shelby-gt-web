( function(){
  
  var ShelbyBaseModel = libs.shelbyGT.ShelbyBaseModel;

  /*
   * Basically the same as a regular Roll model...
   * Except we don't support join/leave, create/update/delete.
   * And we send the access token when GETting the roll.
   */
  libs.shelbyGT.DiscussionRollModel = libs.shelbyGT.RollModel.extend({
  
    // Only supports GET, sends token.
    sync : function(method, model, options) {
      if (!options.url) {
        var url = shelby.config.apiRoot;
        switch (method) {
          case 'read' :
            url += '/roll/' + this.id + '/frames?fast=1&token=' + this.get('token');
            break;
          default:
            throw new Error("'"+method+"' is not supported for DiscussionRolls");
        }
        options.url = url;
      }

      return ShelbyBaseModel.prototype.sync.call(this, method, model, options);
    },
  
    joinRoll : function(onSuccess, onError) {
      throw new Error("joinRoll is not supported for DiscussionRolls");
    },
  
    leaveRoll : function(onSuccess, onError) {
      throw new Error("leaveRoll is not supported for DiscussionRolls");
    },
  
    joinOrLeaveRoll : function() {
      throw new Error("joinOrLeaveRoll is not supported for DiscussionRolls");
    }
  
  });
  
} ) ();