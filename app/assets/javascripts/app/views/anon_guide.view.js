( function(){
  libs.shelbyGT.AnonGuideView = Support.CompositeView.extend({

    events : {},

    template : function(obj){
      return SHELBYJST['anon-guide'](obj);
    },

    initialize : function(){
      this.render();
    },

    render : function(){
      this.$el.html(this.template({user:this.model}));
    }

  });
} )();
