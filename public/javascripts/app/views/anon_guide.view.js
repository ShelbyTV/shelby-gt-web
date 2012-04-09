( function(){
  libs.shelbyGT.AnonGuideView = Support.CompositeView.extend({

    events : {},

    el : '#js-anon-guide',

    template : function(obj){
      return JST['anon-guide'](obj);
    },

    initialize : function(){
      this.render();
    },

    render : function(){
      this.$el.html(this.template({user:this.model}));
    }

  });
} )();
