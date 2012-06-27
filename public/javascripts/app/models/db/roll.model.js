( function(){

  // shorten names of included library items
  var ShelbyBaseModel = libs.shelbyGT.ShelbyBaseModel;
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
            // add the newly followed roll to the correct spot in the roll followings collection
            var searchOffset = rollFollowingsConfig.numSpecialRolls;
            var rankingFunc = function(item){return item.id;};
            var insertAtIndex = shelby.models.rollFollowings.get('rolls').chain().rest(searchOffset).sortedIndex(rollModel, rankingFunc).value() + searchOffset;
            shelby.models.rollFollowings.add(rollModel, {at:insertAtIndex});
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

} ) ();