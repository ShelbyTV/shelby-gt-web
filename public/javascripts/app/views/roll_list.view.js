libs.shelbyGT.RollListView = libs.shelbyGT.SmartRefreshListView.extend({

  className : 'rolls-list js-rolls-list',

  options : _.extend({}, libs.shelbyGT.SmartRefreshListView.prototype.options, {
    collectionAttribute : 'rolls',
    doCheck : libs.shelbyGT.SmartRefreshCheckType.binarySearch,
    doSmartRefresh : true,
    listItemView : 'RollItemRollView'
  }),

  initialize : function() {
      this._filterContent(shelby.models.guide.get('rollListContent'));
      libs.shelbyGT.ListView.prototype.initialize.call(this);
  },

  _cleanup : function() {
      libs.shelbyGT.ListView.prototype._cleanup.call(this);
  },

  _filterContent : function(guidePresentationContent){
    switch(guidePresentationContent){
      case libs.shelbyGT.GuidePresentation.content.rolls.people:
        this.updateFilter(function(model){
          var creator_id = model.get('creator_id');
          return model.get('public') && !model.get('collaborative') && (!creator_id || creator_id != shelby.models.user.id);
        });
        break;
      case libs.shelbyGT.GuidePresentation.content.rolls.myRolls:
        this.updateFilter(function(model){
          var isNotPersonRoll = !model.get('public') || model.get('collaborative');
          var creator_id = model.get('creator_id');
          var isMyPublicRoll = model.get('public') && !model.get('collaborative') && creator_id && creator_id == shelby.models.user.id;
          return isNotPersonRoll || isMyPublicRoll;
        });
        break;
      case libs.shelbyGT.GuidePresentation.content.rolls.browse:
        this.updateFilter(null);
        break;
    }
  },

  _scrollTo : function(element) {
    this.parent.scrollToChildElement(element);
  },

  //ListView overrides
  _listItemViewAdditionalParams : function() {
    return {activationStateModel:shelby.models.guide};
  }

});