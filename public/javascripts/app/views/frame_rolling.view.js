( function(){

  // shorten names of included library prototypes
  var RollingSelectionListView = libs.shelbyGT.RollingSelectionListView;
  var FrameRollingFooterView = libs.shelbyGT.FrameRollingFooterView;
  var ShareActionStateModel = libs.shelbyGT.ShareActionStateModel;
  var ShareActionState = libs.shelbyGT.ShareActionState;
  var RollModel = libs.shelbyGT.RollModel;
  
  libs.shelbyGT.FrameRollingView = Support.CompositeView.extend({

    _frameRollingCompletionView : null,

    _frameRollingState : null,

    events : {
      "click .js-back:not(.js-busy)"  : "_goBack"
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
      this.$el.html(this.template({share:this._frameRollingState.get('shareModel')}));
      this.appendChildInto(new RollingSelectionListView({model:this.options.user,frame:this.model}), '.js-rolling-main');
    },

    revealFrameRollingCompletionView : function(frame, roll, options){
      // default options
      options = _.chain({}).extend(options).defaults({
        type: 'public',
        social: false
      }).value();

      if (!roll) {
        roll = new RollModel({
          'public' : (options.type == 'public'),
          collaborative : true
        });
      }

      if (options.sharing){
        this._isFrameSharing = true;
        this.$('.js-back').html('Cancel');
      } else {
        this.$('.js-back').html('Back');
      }
      
      
      if (roll.get('public')) {
        this._frameRollingState.get('shareModel')._buildNetworkSharingState(shelby.models.user);
      } else if (roll.isNew()) {
        this._frameRollingState.get('shareModel').set('destination',['email']);
      } else {
        this._frameRollingState.get('shareModel').set('destination',[]);
      }
      
      this._frameRollingCompletionView = new libs.shelbyGT.FrameRollingCompletionView({
        frame : frame,
        roll : roll,
        frameRollingState : this._frameRollingState,
        social : options.social,
        sharing : options.sharing
      });
      this.insertChildBefore(this._frameRollingCompletionView, '.js-rolling-main');
    },

    _goBack : function(){
      if (this._isFrameSharing){
        // this is meant to be just a social share, not a rolling action,
        //  so cancel should bring back to original frame view.
        this._frameRollingCompletionView.leave();
        this._frameRollingCompletionView = null;
        this.$('.js-back').html('Cancel');
        this._hide();
      }
      else if (this._frameRollingCompletionView) {
        this._frameRollingCompletionView.leave();
        this._frameRollingCompletionView = null;
        this.$('.js-back').html('Cancel');
      } else {
        this._hide();
      }
    },

    _share : function(){
      this._frameRollingState.set('doShare', ShareActionState.share);
    },

    _rollToPersonalRoll : function(){
      var rollFollowings = shelby.models.user.get('roll_followings');
      var personalRoll = rollFollowings.get(shelby.models.user.get('personal_roll').id);
      this.revealFrameRollingCompletionView(this.model, personalRoll, {social:true});
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
    }

  });

} ) ();
