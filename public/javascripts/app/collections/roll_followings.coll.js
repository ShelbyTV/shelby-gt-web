libs.shelbyGT.RollFollowingsCollection = Backbone.Collection.extend({

  parse : function(response) {
    if (response.result) {
        return response.result.roll_followings || response.result;
    } else {
      return [];
    }
  },

  url : function(){
    return shelby.config.apiRoot + '/user/' + shelby.models.user.id + '/roll_followings';
  }

});
