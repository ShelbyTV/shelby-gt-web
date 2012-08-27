libs.shelbyGT.MainLayoutView = Support.CompositeView.extend({

  el: '.js-main-layout',

  render : function(){
    this.renderChild(new libs.shelbyGT.GuideView({model:this.model}));
    this.renderChild(new libs.shelbyGT.VideoContentPaneView({
      model : this.model,
      userDesires : shelby.models.userDesires
    }));
  }

});