libs.shelbyGT.GuideModel = Backbone.Model.extend({

  defaults : {
    'displayState' : libs.shelbyGT.DisplayState.none,
    'currentRollModel' : null,
    'sinceId'          : null,
    'activeFrameModel' : null,
    'insideRollList' : false
  }

});
