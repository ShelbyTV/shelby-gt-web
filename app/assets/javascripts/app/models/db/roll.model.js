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
            url += '/roll/' + this.id + '/frames?fast=1';
            break;
        }
        options.url = url;
      }

      return ShelbyBaseModel.prototype.sync.call(this, method, model, options);
    },
    
    updateUrl : function(){
      return shelby.config.apiRoot + '/roll/' + this.id;
    },

    joinRoll : function(onSuccess, onError) {
      var rollToJoin = new libs.shelbyGT.RollModel();
      var url = shelby.config.apiRoot + '/roll/' + this.id + '/join';
      var params = {
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
      };
      if (onError) {
        params.error = function(rollModel, response){
          onError(rollModel, response);
        };
      }
      rollToJoin.save(null, params);

      shelby.track('joined_roll', {id: this.id, userName: shelby.models.user.get('nickname')});
    },

    leaveRoll : function(onSuccess, onError) {
      var rollToLeave = new libs.shelbyGT.RollModel();
      var url = shelby.config.apiRoot + '/roll/' + this.id + '/leave';
      var params = {
        url : url,
        success : function(rollModel, response){
          shelby.models.rollFollowings.remove(rollModel);
          if (onSuccess) {
            onSuccess(rollModel, response);
          }
        }
      };
      if (onError) {
        params.error = function(rollModel, response){
          onError(rollModel, response);
        };
      }
      rollToLeave.save(null, params);

      shelby.track( 'left_roll',  {id: this.id, userName: shelby.models.user.get('nickname')} );
    },

    joinOrLeaveRoll : function() {
      if ( shelby.models.rollFollowings.containsRoll(this) ){
        this.leaveRoll();
      } else {
        this.joinRoll();
      }
    },
    
    isPostableBy: function(user){
      //can't post to discussion rolls
      if (this.get('roll_type') == libs.shelbyGT.RollModel.TYPES.user_discussion_roll){
        return false;
      }
      
      // user can post to their hearts
      if (this.get('roll_type') == libs.shelbyGT.RollModel.TYPES.special_hearted &&
          this.get('creator_id') == user.id ){
        return true;
      }
      
      // anything user created or is collaborative
      if (this.get('creator_id') == user.id || this.get('collaborative')) {
        return true;
      }

      // otherwise, it's non-collaborative and I can't post
      return false;
    }

  });
  
  libs.shelbyGT.RollModel.TYPES = {
    // special rolls that have not yet been updated to their specific type default to :special_roll
    special_roll : 10,    // <-- faux
    special_public : 11,  // <-- faux
    special_hearted : 12,
    special_watch_later : 13,
    //Differentiate special_public rolls of real shelby users and those faux-users whome we deem special
    special_public_real_user : 15,  // <-- real
    special_public_upgraded : 16,   // <-- real
    // special rolls are < all_special_rolls (convenience)
    all_special_rolls: 17,

    // User-created non-collaborative public rolls (previously these were collaborative, we're changing that)
    user_public : 30,
    // Company-created collaborative public rolls
    global_public : 31,
    // User-created collaborative private rolls
    user_private : 50,
    // User-created private conversations (aka Discussion Rolls)
    user_discussion_roll : 51,

    genius : 70
  };

} ) ();
