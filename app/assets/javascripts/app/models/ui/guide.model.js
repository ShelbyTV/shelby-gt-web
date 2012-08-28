libs.shelbyGT.GuideModel = Backbone.Model.extend({

  defaults : {
    activeFrameModel            : null,
    currentRollModel            : null,
    disableSmartRefresh         : false,
    displayIsolatedRoll         : false,
    displayState                : libs.shelbyGT.DisplayState.none,
    rollListContent             : null,
    sinceId                     : null
  }

});
