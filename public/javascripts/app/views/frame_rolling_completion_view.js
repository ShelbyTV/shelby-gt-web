( function(){

  // shorten names of included library prototypes
  var ListView = libs.shelbyGT.ListView;
  var FrameRollingShareView = libs.shelbyGT.FrameRollingShareView;
  var ShareModel = libs.shelbyGT.ShareModel;
  var RollModel = libs.shelbyGT.RollModel;

  libs.shelbyGT.FrameRollingCompletionView = Support.CompositeView.extend({

    className : 'frame-rolling-completion',

    template : function(obj){
      return JST['frame-rolling-completion'](obj);
    },

    render : function(){
      this.$el.html(this.template({
        roll : this.options.roll,
        frame : this.options.frame,
        social : this.options.social
      }));
      if (!this.options.roll.get('public')) {
        this.$el.addClass('frame-rolling-private');
      }
      var shareSubView = new FrameRollingShareView({
        model : this.options.frameRollingState.get('shareModel'),
        roll : this.options.roll,
        frame : this.options.frame,
        frameRollingState : this.options.frameRollingState
      });
      this.appendChild(shareSubView);
    }

  });

} ) ();
