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
      "click .js-back:not(.js-busy)"  : "_goBack",
      "click .js-done"  : "_share"
    },

    className : 'js-rolling-frame rolling-frame',

    template : function(obj){
      return JST['frame-rolling'](obj);
    },

    initialize : function(){
      this._frameRollingState = new ShareActionStateModel();
      this._frameRollingState.bind('change:doShare', this._onDoShareChange, this);
      this._frameRollingState.get('shareModel').bind('change:destination', this._onShareDestinationChange, this);
    },

    _cleanup : function(){
      this._frameRollingState.unbind('change:doShare', this._onDoShareChange, this);
      this._frameRollingState.get('shareModel').unbind('change:destination', this._onShareDestinationChange, this);
    },

    render : function(){
      this.$el.html(this.template({share:this._frameRollingState.get('shareModel')}));
      this.appendChildInto(new RollingSelectionListView({model:this.options.user,frame:this.model}), '.js-rolling-main');
      this.spinner = new libs.shelbyGT.SpinnerView({
        el: '.js-done',
        hidden : true,
        replacement : true
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
        this.$('.js-back').html('Back');
        this._showingNewRollView = true;
      } else {
        this.$('.js-back').html('Done');
      }
      this._frameRollingCompletionView = new libs.shelbyGT.FrameRollingCompletionView({
        newFrame:newFrame,
        oldFrame:oldFrame,
        roll:roll,
        frameRollingState:this._frameRollingState
      });
      this.insertChildBefore(this._frameRollingCompletionView, '.js-rolling-footer');
      this.$('.js-done').show();
      this.$('.js-social').hide();
    },

    _goBack : function(){
      if (this._showingNewRollView) {
        this._frameRollingCompletionView.leave();
        this._frameRollingCompletionView = null;
        this.$('.js-back').html('Cancel');
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
      switch (doShare) {
        case ShareActionState.complete :
          this._hide();
          break;
        case ShareActionState.share :
          this.$('.js-back').addClass('js-busy');
          break;
        case ShareActionState.failed :
          this.$('.js-back').removeClass('js-busy');
          break;
      }
    },

    _onShareDestinationChange: function(shareModel, destination){
      if (destination.length) {
        this.$('.js-done').html('Comment and Share');
      } else {
        this.$('.js-done').html('Comment');
      }
    }

  });

} ) ();
