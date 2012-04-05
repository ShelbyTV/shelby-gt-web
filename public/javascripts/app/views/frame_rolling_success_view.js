( function(){

  // shorten names of included library prototypes
  var ListView = libs.shelbyGT.ListView;
  var RollSelectionItemView = libs.shelbyGT.RollSelectionItemView;
  var FrameShareView = libs.shelbyGT.FrameShareView;
  var ShareModel = libs.shelbyGT.ShareModel;

  libs.shelbyGT.FrameRollingSuccessView = Support.CompositeView.extend({

    className : 'frame-rolling-success',

    template : function(obj){
      return JST['frame-rolling-success'](obj);
    },

    render : function(){
      this.$el.html(this.template({frame:this.options.frame}));
      this.appendChild(new FrameShareView({model:new ShareModel()}));
    }

  });

} ) ();
