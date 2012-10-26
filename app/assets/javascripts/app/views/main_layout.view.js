libs.shelbyGT.MainLayoutView = Support.CompositeView.extend({

  el: '.js-main-layout',

  render : function(){
    this.renderChild(new libs.shelbyGT.GuideView({model:this.model}));
    this.renderChild(new libs.shelbyGT.MainContentWrapperView({
      inviteViewState : shelby.models.inviteViewState,
      model : this.model
    }));
  }

});