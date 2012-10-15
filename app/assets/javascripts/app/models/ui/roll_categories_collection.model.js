libs.shelbyGT.RollCategoriesCollectionModel = libs.shelbyGT.ShelbyBaseModel.extend({

  relations : [
    {
      type : Backbone.HasMany,
      key : 'roll_categories',
      relatedModel : 'libs.shelbyGT.RollCategoryModel',
      collectionType : 'libs.shelbyGT.RollCategoriesCollection'
    }
  ],
  
  url : function() {
    return shelby.config.apiRoot + '/roll/featured' + this._queryParams();
  },
  
  _queryParams : function(){
    var queryParams = [];
    if(this.get('segment')) queryParams.push('segment='+this.get('segment'));
    
    if(queryParams.length > 0) {
      return "?"+queryParams.join("&");
    } else {
      return "";
    }
  },

  parse : function(response) {
    return ({
      roll_categories : response.result || []
    });
  }

});
