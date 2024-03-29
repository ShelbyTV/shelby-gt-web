libs.shelbyGT.GuideModel = Backbone.Model.extend({

  defaults : {
    activeFrameModel            : null,
    currentRollModel            : null,
    currentChannelId            : null,
    displayIsolatedRoll         : false,
    displayState                : libs.shelbyGT.DisplayState.none,
    sinceId                     : null,
    hasShownDynamicRec          : false,
  }

});
