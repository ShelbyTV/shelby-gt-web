libs.shelbyGT.GuideView = Support.CompositeView.extend({

  el: '.js-main-layout .js-guide',

  template : function(obj){
      return JST['guide'](obj);
  },

  render : function(){
    this.$el.html(this.template());

    this.renderChild(new libs.shelbyGT.ItemHeaderView({model:this.model}));
    this.renderChild(new libs.shelbyGT.RollActionMenuView({
      model : shelby.models.guide,
      viewState : new libs.shelbyGT.RollActionMenuViewStateModel()
    }));
    this.renderChild(new libs.shelbyGT.addVideoView({model:this.model}));
    this.renderChild(new libs.shelbyGT.GuideContentView({model:this.model}));
  }

});