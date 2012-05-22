libs.shelbyGT.RollFollowingsCollection = Backbone.Collection.extend({

  parse : function(response) {
    return (response.result || []);
  },

  url : function(){
    return shelby.config.apiRoot + '/user/' + shelby.models.user.id + '/roll_followings';
  }

});
