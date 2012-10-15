( function(){
  libs.shelbyGT.AnonGuideView = Support.CompositeView.extend({

    events : {},

    template : function(obj){
      return SHELBYJST['anon-guide'](obj);
    },

    initialize : function(){
      console.log('hizzle');
      this.render();
    },

    render : function(){
      this.$el.html(this.template({user:this.model}));
    }

  });
} )();
