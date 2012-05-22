libs.shelbyGT.RollListView = libs.shelbyGT.ListView.extend({

  className : /*libs.shelbyGT.ListView.prototype.className +*/ 'rolls-list js-rolls-list',

  options : _.extend({}, libs.shelbyGT.ListView.prototype.options, {
    collectionAttribute : 'roll_followings',
    listItemView : 'RollItemView'
  }),

  initialize : function() {
      shelby.models.guide.bind('change:tryAutoScroll', this._scrollToActiveRollItemView, this);
      shelby.models.guidePresentation.bind('change:content', this._onContentChanged, this);
      this._filterContent(shelby.models.guidePresentation.get('content'));
      libs.shelbyGT.ListView.prototype.initialize.call(this);
  },

  _cleanup : function() {
      shelby.models.guide.unbind('change:tryAutoScroll', this._scrollToActiveRollItemView, this);
      shelby.models.guidePresentation.unbind('change:content', this._onContentChanged, this);
      libs.shelbyGT.ListView.prototype._cleanup.call(this);
  },

  _scrollToActiveRollItemView : function(guideModel, tryAutoScroll) {
    if (tryAutoScroll) {
      var activeFrameModel = guideModel.get('activeFrameModel');
      if (activeFrameModel) {
        var roll = activeFrameModel.get('roll');
        if (roll) {
          var activeRollItemView = this.children.find(function(childView){
              if (childView.model.id == roll.id) {
                return true;
              }
          }).value();
          if (activeRollItemView) {
            this._scrollTo(activeRollItemView.el);
          }
        }
      }
      guideModel.set('tryAutoScroll', false);
    }
  },

  _onContentChanged : function(guidePresentationModel, content){
    var filterOnlyStates = libs.shelbyGT.GuidePresentation.content.rolls.filterOnlyStates;
    //only do something if we can reach our desired state by filtering alone
    //otherwise, the guide presentation selector view will cause a rerouting
    //to display a different set of rolls in response to this same event
    if (_(filterOnlyStates).include(content) &&
        _(filterOnlyStates).include(guidePresentationModel.previous('content'))) {
      this._filterContent(content);
    }
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
    }
  },

  _scrollTo : function(element) {
    this.parent.scrollToChildElement(element);
  }

});