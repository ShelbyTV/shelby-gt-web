( function(){

  // shorten names of included library items
  var ShelbyBaseModel = libs.shelbyGT.ShelbyBaseModel;
  var BackboneCollectionUtils = libs.utils.BackboneCollectionUtils;
  var rollFollowingsConfig = shelby.config.db.rollFollowings;

  libs.shelbyGT.RollModel = ShelbyBaseModel.extend({

    relations : [{
      type : Backbone.HasMany,
      key : 'frames',
      relatedModel : 'libs.shelbyGT.FrameModel',
      collectionType : 'libs.shelbyGT.FramesCollection'
    }],

    sync : function(method, model, options) {
      if (!options.url) {
        var url = shelby.config.apiRoot;
        switch (method) {
          case 'create' :
            url += '/roll';
            break;
          case 'update' :
          case 'delete' :
            url += '/roll/' + this.id;
            break;
          case 'read' :
            url += '/roll/' + this.id + '/frames';
            break;
        }
        options.url = url;
      }

      return ShelbyBaseModel.prototype.sync.call(this, method, model, options);
    },

    joinRoll : function(onSuccess) {
      var rollToJoin = new libs.shelbyGT.RollModel();
      var url = shelby.config.apiRoot + '/roll/' + this.id + '/join';
      rollToJoin.save(null,
        {
          url : url,
          success : function(rollModel, response){
            BackboneCollectionUtils.insertAtSortedIndex(rollModel,
              shelby.models.rollFollowings.get('rolls'), 
                {searchOffset:rollFollowingsConfig.numSpecialRolls, 
                  sortAttribute:rollFollowingsConfig.sortAttribute,
                  sortDirection:rollFollowingsConfig.sortDirection});
            if (onSuccess) {
              onSuccess(rollModel, response);
            }
          }
        }
      );
    },

    leaveRoll : function(onSuccess) {
      var rollToLeave = new libs.shelbyGT.RollModel();
      var url = shelby.config.apiRoot + '/roll/' + this.id + '/leave';
      rollToLeave.save(null,
        {
          url : url,
          success : function(rollModel, response){
            shelby.models.rollFollowings.remove(rollModel);
            if (onSuccess) {
              onSuccess(rollModel, response);
            }
          }
        }
      );
    }

  });
  
  libs.shelbyGT.RollModel.TYPES = {
    // special rolls that have not yet been updated to their specific type default to :special_roll
    special_roll : 10,
    special_public : 11,
    special_hearted : 12,
    special_watch_later : 13,
    // special rolls are < all_special_rolls (convenience)
    all_special_rolls: 14,

    // User-created non-collaborative public rolls (previously these were collaborative, we're changing that)
    user_public : 30,
    // Company-created collaborative public rolls
    global_public : 31,
    // User-created collaborative private rolls
    user_private : 50,

    genius : 70
  };

} ) ();