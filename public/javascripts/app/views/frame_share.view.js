( function(){

  // shorten names of included library prototypes
  var ListView = libs.shelbyGT.ListView;
  var RollSelectionItemView = libs.shelbyGT.RollSelectionItemView;

  libs.shelbyGT.FrameShareView = Support.CompositeView.extend({

    className : 'frame-share',

    template : function(obj){
      return JST['frame-share'](obj);
    },

    render : function(){
      this.$el.html(this.template({frame:this.options.frame}));
    }

  });

} ) ();
