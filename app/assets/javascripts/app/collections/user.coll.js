libs.shelbyGT.UserCollection = Backbone.Collection.extend({

  model: libs.shelbyGT.UserModel,

  // method fetchUserInfo: fetch the publicly available information for a set of users, passed in as an array of user id strings
  fetchUserInfo: function(ids) {
    this.fetch({
      url : shelby.config.apiRoot + '/user',
      data : {
        ids : ids.join(",")
      }
    });
  },

  parse : function(response) {
    return response.result;
  }

});