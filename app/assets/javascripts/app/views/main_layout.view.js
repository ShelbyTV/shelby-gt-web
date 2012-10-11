libs.shelbyGT.MainLayoutView = Support.CompositeView.extend({

  el: '.js-main-layout',

  render : function(){
    this.renderChild(new libs.shelbyGT.GuideView({model:this.model}));
    this.renderChild(new libs.shelbyGT.VideoContentPaneView({
      guide : shelby.models.guide,
      playbackState : shelby.models.playbackState
    }));
  }

});