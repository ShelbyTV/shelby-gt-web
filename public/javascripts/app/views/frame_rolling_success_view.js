( function(){

  // shorten names of included library prototypes
  var ListView = libs.shelbyGT.ListView;
  var RollSelectionItemView = libs.shelbyGT.RollSelectionItemView;
  var FrameShareView = libs.shelbyGT.FrameShareView;
  var ShareModel = libs.shelbyGT.ShareModel;

  libs.shelbyGT.FrameRollingSuccessView = Support.CompositeView.extend({

    _frameShareView : null,

    className : 'frame-rolling-success',

    template : function(obj){
      return JST['frame-rolling-success'](obj);
    },

    render : function(){
      this.$el.html(this.template({frame:this.options.oldFrame,roll:this.options.roll}));
      this._frameShareView = new FrameShareView({model:new ShareModel(),frame:this.options.newFrame});
      this.appendChild(this._frameShareView);
    },

    share : function() {
      this._frameShareView._share();
    }

  });

} ) ();
