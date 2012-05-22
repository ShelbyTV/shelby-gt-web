//if the guide.model.js tells us WHAT to show at a top level, this model tells us HOW to show it (or what specific to show at a lower level)

libs.shelbyGT.GuidePresentationModel = Backbone.Model.extend({

  defaults : {
    size : libs.shelbyGT.GuidePresentation.size.small,
    content : libs.shelbyGT.GuidePresentation.content.rolls.myRolls
  }

});
