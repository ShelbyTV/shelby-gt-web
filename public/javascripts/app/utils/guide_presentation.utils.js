libs.shelbyGT.GuidePresentation = {
  content : {
    rolls : {
      people : 'people',
      myRolls : 'my_rolls',
      browse : 'browse',
      switchFilterOnlyStates : ['people', 'my_rolls']
    }
  },
  shouldFetchRolls : function(oldContent, newContent){
    //we are only going to fetch the browse rolls once per front-end 'session'
    //otherwise, the roll list will be rendered from the already fetched data
    var contentIsBrowseRolls = newContent == libs.shelbyGT.GuidePresentation.content.rolls.browse;
    var switchingBetweenFilters = this._switchContentFilterOnly(oldContent, newContent);
    return !switchingBetweenFilters && (!contentIsBrowseRolls || !shelby.models.fetchState.get('browseRollsFetched'));
  },
  _switchContentFilterOnly : function(oldContent, newContent){
    var _switchFilterOnlyStates = _(this.content.rolls.switchFilterOnlyStates);
    return _switchFilterOnlyStates.contains(oldContent) && _switchFilterOnlyStates.contains(newContent);
  }
};