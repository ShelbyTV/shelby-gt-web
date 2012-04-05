( function(){

  // shorten names of included library prototypes
  var RollingSelectionListView = libs.shelbyGT.RollingSelectionListView;
  var FrameRollingFooterView = libs.shelbyGT.FrameRollingFooterView;
  
  libs.shelbyGT.FrameRollingView = Support.CompositeView.extend({

    events : {
      "click .js-back" : "_goBack"
    },

    className : 'js-rolling-frame rolling-frame',

    template : function(obj){
      return JST['frame-rolling'](obj);
    },

    render : function(){
      this.$el.html(this.template());
      this.appendChildInto(new RollingSelectionListView({model:this.options.user,frame:this.model}), '.js-rolling-main');
    },

    revealFrameRollingSuccessView : function(){
      this.insertChildBefore(new libs.shelbyGT.FrameRollingSuccessView({frame:this.model}), '.js-rolling-footer');
    },

    _goBack : function(){
      this.$el.removeClass('rolling-frame-trans');
    }

  });

} ) ();
