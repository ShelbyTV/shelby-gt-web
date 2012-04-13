( function(){

  // shorten names of included library prototypes
  var RollingSelectionListView = libs.shelbyGT.RollingSelectionListView;
  var FrameRollingFooterView = libs.shelbyGT.FrameRollingFooterView;
  var ShareActionStateModel = libs.shelbyGT.ShareActionStateModel;
  var ShareActionState = libs.shelbyGT.ShareActionState;
  var RollModel = libs.shelbyGT.RollModel;
  
  libs.shelbyGT.FrameRollingView = Support.CompositeView.extend({

    _frameRollingCompletionView : null,

    _showingNewRollView : false,

    _frameRollingState : null,

    events : {
      "click .js-back"  : "_goBack",
      "click .js-done"  : "_share"
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
      this.$el.html(this.template());
      this.appendChildInto(new RollingSelectionListView({model:this.options.user,frame:this.model}), '.js-rolling-main');
      this.spinner = new libs.shelbyGT.SpinnerView({
        el: '.js-done',
        hidden : true,
        replacement : true,
        spinOpts : {
          lines: 13,
          length: 0,
          width: 3,
          radius: 7,
          rotate: 0,
          color: '#000',
          speed: 1.4,
          trail: 62,
          shadow: false,
          hwaccel: true,
          className: 'spinner',
          zIndex: 2e9,
          top: 'auto',
          left: 'auto'
        }
      });
      this.renderChild(this.spinner);
    },

    revealFrameRollingCompletionView : function(newFrame, oldFrame, roll, options){
      var defaults = {
        type: 'public'
      };
      if (!options) {
        options = defaults;
      } else {
        _(options).defaults(defaults);
      }

      if (!roll) {
        roll = new RollModel({
          'public' : (options.type == 'public'),
          collaborative : true
        });
        this._showingNewRollView = true;
      }
      this._frameRollingCompletionView = new libs.shelbyGT.FrameRollingCompletionView({
        newFrame:newFrame,
        oldFrame:oldFrame,
        roll:roll,
        frameRollingState:this._frameRollingState
      });
      this.insertChildBefore(this._frameRollingCompletionView, '.js-rolling-footer');
      this.$('.js-done').show();
    },

    _goBack : function(){
      if (this._showingNewRollView) {
        this._frameRollingCompletionView.leave();
        this._frameRollingCompletionView = null;
        this.$('.js-done').hide();
        this._showingNewRollView = false;
      } else {
        this._hide();
      }
    },

    _share : function(){
      this._frameRollingState.set('doShare', ShareActionState.share);
    },

    _hide : function(){
      this.$el.removeClass('rolling-frame-trans');
    },

    _onDoShareChange: function(shareActionStateModel, doShare){
      if (doShare == ShareActionState.complete) {
        this._hide();
      }
    }

  });

} ) ();
