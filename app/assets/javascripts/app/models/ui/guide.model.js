libs.shelbyGT.GuideModel = Backbone.Model.extend({

  defaults : {
    activeFrameModel            : null,
    currentRollModel            : null,
    displayIsolatedRoll         : false,
    displayState                : libs.shelbyGT.DisplayState.none,
    onboardingStage             : null,
    playingFramesCollection     : null,
    sinceId                     : null
  }

});
