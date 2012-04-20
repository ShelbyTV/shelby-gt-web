( function(){

  // shorten names of included library prototypes
  var ListView = libs.shelbyGT.ListView;
  var FrameShareView = libs.shelbyGT.FrameShareView;
  var FrameRollingNewRollView = libs.shelbyGT.FrameRollingNewRollView;
  var ShareModel = libs.shelbyGT.ShareModel;
  var RollModel = libs.shelbyGT.RollModel;

  libs.shelbyGT.FrameRollingCompletionView = Support.CompositeView.extend({

    className : 'frame-rolling-completion',

    template : function(obj){
      return JST['frame-rolling-completion'](obj);
    },

    render : function(){
      this.$el.html(this.template({frame:this.options.oldFrame,roll:this.options.roll}));
      var shareSubView;
      if (!this.options.roll.isNew()) {
        shareSubView = new FrameShareView({
          model : this.options.frameRollingState.get('shareModel'),
          frame : this.options.newFrame,
          frameRollingState : this.options.frameRollingState
        });
      } else {
        shareSubView = new FrameRollingNewRollView({
          model : this.options.frameRollingState.get('shareModel'),
          roll : this.options.roll,
          frame : this.options.oldFrame,
          frameRollingState : this.options.frameRollingState
        });
      }
      this.appendChild(shareSubView);
    }

  });

} ) ();
