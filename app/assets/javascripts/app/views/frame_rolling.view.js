( function(){

  // shorten names of included library prototypes
  var GuideOverlayView = libs.shelbyGT.GuideOverlayView;
  var RollingCreateRollView = libs.shelbyGT.RollingCreateRollView;
  var RollingSelectionListView = libs.shelbyGT.RollingSelectionListView;
  var ShareActionStateModel = libs.shelbyGT.ShareActionStateModel;
  var ShareActionState = libs.shelbyGT.ShareActionState;
  
  libs.shelbyGT.FrameRollingView = GuideOverlayView.extend({

    _frameRollingState : null,

    events : _.extend({}, GuideOverlayView.prototype.events, {
      "click .back:not(.js-busy)"  : "_setGuideOverlayStateNone"
    }),

    className : 'js-rolling-frame rolling-frame',

    template : function(obj){
      return JST['frame-rolling'](obj);
    },

    initialize : function(){
      this._frameRollingState = new libs.shelbyGT.ShareActionStateModel();
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

      GuideOverlayView.prototype.render.call(this);
    },

    _onDoShareChange: function(shareActionStateModel, doShare){
      switch (doShare) {
        case ShareActionState.complete :
          this.hide();
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
    }

  });

} ) ();
