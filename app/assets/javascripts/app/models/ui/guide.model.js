libs.shelbyGT.GuideModel = Backbone.Model.extend({

  defaults : {
    activeFrameModel            : null,
    currentRollModel            : null,
    disableSmartRefresh         : false,
    displayIsolatedRoll         : false,
    displayState                : libs.shelbyGT.DisplayState.none,
    playingFramesCollection     : null,
    playingState                : libs.shelbyGT.PlayingState.none,
    rollListContent             : null,
    sinceId                     : null,
    skippingVideo               : false
  }

});
