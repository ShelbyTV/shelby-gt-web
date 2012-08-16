libs.shelbyGT.GuidePresentation = {
  content : {
    rolls : {
      myRolls : 'my_rolls',
      browse : 'browse'
    }
  },
  shouldFetchRolls : function(guideModel){
    //we are only going to fetch the browse rolls once per front-end 'session'
    //otherwise, the roll list will be rendered from the already fetched data
    var contentIsBrowseRolls = guideModel.get('rollListContent') == libs.shelbyGT.GuidePresentation.content.rolls.browse;
    // var _changedAttrs = _(guideModel.changedAttributes());
    // var switchingBetweenFilters = _changedAttrs.has('rollListContent') &&
    //                               this._switchContentFilterOnly(guideModel.previous('rollListContent'), guideModel.get('rollListContent'));
    // var notSwitchingDisplayState = !_changedAttrs.has('displayState');
    // return !(switchingBetweenFilters && notSwitchingDisplayState) && (!contentIsBrowseRolls || !shelby.models.fetchState.get('browseRollsFetched'));
    return !contentIsBrowseRolls || !shelby.models.fetchState.get('browseRollsFetched');
  }
};