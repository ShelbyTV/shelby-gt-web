// implements common functionality needed by models in the shelby app

libs.shelbyGT.ShelbyBaseModel = Backbone.RelationalModel.extend({
  // extract the JSON from the "result" property of a Shelby API response
  parse : function (response) {
    return response.result;
  },

  getFirstName : function(){
    return this.get('name').split(' ')[0];
  }

});
