( function(){

  // shorten names of included library prototypes
  var RollActionMenuView = libs.shelbyGT.RollActionMenuView;
  var ItemHeaderView = libs.shelbyGT.ItemHeaderView;
  var AnonGuideView = libs.shelbyGT.AnonGuideView;
  var GuidePresentationSelectorView = libs.shelbyGT.GuidePresentationSelectorView;

  libs.shelbyGT.MenuView = Support.CompositeView.extend({

    el : '.menu',

    template : function(obj){
      return JST['menu'](obj);
    },
    
    initialize : function(){
      this.render();
    },

    render : function(active){
      this.$el.html(this.template());
      this.renderChild(new GuidePresentationSelectorView({model:shelby.models.guidePresentation}));
      this.renderChild(new ItemHeaderView({model:this.model}));
      this.renderChild(new RollActionMenuView({model:this.model}));
    }
  });

} ) ();
