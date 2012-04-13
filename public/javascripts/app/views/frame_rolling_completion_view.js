( function(){

  // shorten names of included library prototypes
  var ListView = libs.shelbyGT.ListView;
  var FrameShareView = libs.shelbyGT.FrameShareView;
  var FrameRollingNewRollView = libs.shelbyGT.FrameRollingNewRollView;
  var ShareModel = libs.shelbyGT.ShareModel;
  var RollModel = libs.shelbyGT.RollModel;

  libs.shelbyGT.FrameRollingCompletionView = Support.CompositeView.extend({

    events : {
      // these events only relevant when creating a new roll
      "keyup .js-new-roll-name-input" : "_updateRollTitle",
      "focus .js-new-roll-name-input" : "_onFocusRollTitle"
    },

    _shareSubView : null,

    className : 'frame-rolling-completion',

    template : function(obj){
      return JST['frame-rolling-completion'](obj);
    },

    render : function(){
      this.$el.html(this.template({frame:this.options.oldFrame,roll:this.options.roll}));
      if (!this.options.roll.isNew()) {
        this._shareSubView = new FrameShareView({
          model : new ShareModel(),
          frame : this.options.newFrame,
          frameRollingState : this.options.frameRollingState
        });
      } else {
        this.$el.append(JST['frame-rolling-options']({roll:this.options.roll}));
        this._shareSubView = new FrameRollingNewRollView({
          model : new ShareModel(),
          roll : this.options.roll,
          frame : this.options.oldFrame,
          frameRollingState : this.options.frameRollingState
        });
      }
      this.appendChild(this._shareSubView);
    },

    _updateRollTitle : function(e){
      this.options.roll.set('title',$(e.currentTarget).val());
    },

    _onFocusRollTitle : function(){
      // remove the error highlight from the roll title input on focus if there is one
      this.$('.js-new-roll-name-input').removeClass('error');
    }

  });

} ) ();
