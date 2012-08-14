libs.shelbyGT.ExploreLayoutView = Support.CompositeView.extend({

  el: '.js-explore-layout',

  template : function(obj){
      return JST['explore-layout'](obj);
  },

  render : function(){
    this.$el.html(this.template());
    // this.renderChild(new libs.shelbyGT.GuideView({model:this.model}));
    // this.renderChild(new libs.shelbyGT.VideoContentPaneView({
    //   model : this.model,
    //   userDesires : shelby.models.userDesires
    // }));
  }

});