( function(){

  // shorten names of included library prototypes
  var RollingCreateRollView = libs.shelbyGT.RollingCreateRollView;
  var RollingSelectionListView = libs.shelbyGT.RollingSelectionListView;
  var ShareActionStateModel = libs.shelbyGT.ShareActionStateModel;
  var ShareActionState = libs.shelbyGT.ShareActionState;
  
  libs.shelbyGT.FrameRollingView = libs.shelbyGT.GuideOverlayView.extend({

    _frameRollingState : null,

    events : {
      "click .back:not(.js-busy)"  : "cancel"
    },

    className : 'js-rolling-frame rolling-frame',

    template : function(obj){
      return JST['frame-rolling'](obj);
    },

    initialize : function(){
      this._frameRollingState = new ShareActionStateModel();
      this._frameRollingState.bind('change:doShare', this._onDoShareChange, this);
    },

    _cleanup : function(){
      this._frameRollingState.unbind('change:doShare', this._onDoShareChange, this);
    },

    render : function(){
      this.$el.html(this.template({frame:this.model, share:this._frameRollingState.get('shareModel')}));
      
      //new Roll
      var newRollView = new RollingCreateRollView(
        {
          frame : this.model,
          frameRollingState : this._frameRollingState
        }
      );
      this.appendChildInto(newRollView, '.js-rolling-main-new-roll');

      //existing Rolls
      var rollsListView = new RollingSelectionListView(
        {
          model : shelby.models.rollFollowings,
          frame : this.model,
          frameRollingState : this._frameRollingState,
          doStaticRender : true
        }
      );
      this.appendChildInto(rollsListView, '.js-existing-rolls-list');

      this.insertIntoDom(false);
    },

    cancel : function(){
      this._resetAndHide();
    },

    _onDoShareChange: function(shareActionStateModel, doShare){
      switch (doShare) {
        case ShareActionState.complete :
          this._resetAndHide();
          break;
        case ShareActionState.share :
          //TODO: show spinner (via GuideOverlay?)
          this.$('.back').addClass('js-busy');
          break;
        case ShareActionState.failed :
          //TODO: hide spinner (via GuideOverlay?)
          this.$('.back').removeClass('js-busy');
          break;
      }
    },
    
    _resetAndHide: function(){      
      //TODO: hide spinner (via GuideOverlay?)
      
      this.hide();
    }

  });

} ) ();
