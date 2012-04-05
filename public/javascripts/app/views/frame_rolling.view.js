( function(){

  // shorten names of included library prototypes
  var RollingSelectionListView = libs.shelbyGT.RollingSelectionListView;
  var FrameRollingFooterView = libs.shelbyGT.FrameRollingFooterView;
  
  libs.shelbyGT.FrameRollingView = Support.CompositeView.extend({

    _frameRollingSuccessView : null,

    events : {
      "click .js-back"  : "_goBack",
      "click .js-done"  : "_share"
    },

    className : 'js-rolling-frame rolling-frame',

    template : function(obj){
      return JST['frame-rolling'](obj);
    },

    render : function(){
      this.$el.html(this.template());
      this.appendChildInto(new RollingSelectionListView({model:this.options.user,frame:this.model}), '.js-rolling-main');
    },

    revealFrameRollingSuccessView : function(newFrame, oldFrame){
      this._frameRollingSuccessView = new libs.shelbyGT.FrameRollingSuccessView({newFrame:newFrame,oldFrame:oldFrame});
      this.insertChildBefore(this._frameRollingSuccessView, '.js-rolling-footer');
    },

    _goBack : function(){
      this.$el.removeClass('rolling-frame-trans');
    },

    _share : function(){
      this._frameRollingSuccessView.share();
    }

  });

} ) ();
