( function(){

  // shorten names of included library prototypes
  var RollingSelectionListView = libs.shelbyGT.RollingSelectionListView;
  
  libs.shelbyGT.FrameRollingView = Support.CompositeView.extend({

    className : 'js-rolling-frame rolling-frame',

    template : function(obj){
      return JST['frame-rolling'](obj);
    },

    render : function() {
      this.$el.html(this.template());
      this.appendChildInto(new RollingSelectionListView({model:shelby.models.user,frame:this.model}), '.js-rolling-main');
    }

  });

} ) ();
