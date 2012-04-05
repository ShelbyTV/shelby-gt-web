( function(){

  // shorten names of included library prototypes
  var ListView = libs.shelbyGT.ListView;
  var RollSelectionItemView = libs.shelbyGT.RollSelectionItemView;
  var FrameShareView = libs.shelbyGT.FrameShareView;
  var ShareModel = libs.shelbyGT.ShareModel;

  libs.shelbyGT.FrameRollingCompletionView = Support.CompositeView.extend({

    _shareSubView : null,

    className : 'frame-rolling-completion',

    template : function(obj){
      return JST['frame-rolling-completion'](obj);
    },

    render : function(){
      this.$el.html(this.template({frame:this.options.oldFrame,roll:this.options.roll}));
      if (!this.options.roll.isNew()) {
        this._shareSubView = new FrameShareView({model:new ShareModel(),frame:this.options.newFrame});
        this.appendChild(this._shareSubView);
      } else {
        this.$el.append(JST['frame-rolling-options']({roll:this.options.roll}));
      }
    },

    share : function() {
      this._shareSubView._share();
    }

  });

} ) ();
