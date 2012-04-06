( function(){

  // shorten names of included library prototypes
  var RollingSelectionListView = libs.shelbyGT.RollingSelectionListView;
  var FrameRollingFooterView = libs.shelbyGT.FrameRollingFooterView;
  var RollModel = libs.shelbyGT.RollModel;
  
  libs.shelbyGT.FrameRollingView = Support.CompositeView.extend({

    _frameRollingCompletionView : null,

    _showingNewRollView : false,

    events : {
      "click .js-back"  : "_goBack",
      "click .js-done"  : "_share"
    },

    className : 'js-rolling-frame rolling-frame',

    template : function(obj){
      return JST['frame-rolling'](obj);
    },

    render : function(){
      this.$el.html(this.template());
      this.appendChildInto(new RollingSelectionListView({model:this.options.user,frame:this.model}), '.js-rolling-main');
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
        roll = new RollModel({'public':(options.type == 'public')});
        this._showingNewRollView = true;
      }
      this._frameRollingCompletionView = new libs.shelbyGT.FrameRollingCompletionView({newFrame:newFrame,oldFrame:oldFrame,roll:roll});
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
        this.$el.removeClass('rolling-frame-trans');
      }
    },

    _share : function(){
      this._frameRollingCompletionView.share();
    }

  });

} ) ();
