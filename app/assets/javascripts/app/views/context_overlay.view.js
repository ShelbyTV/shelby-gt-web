( function(){

  var FrameGroupView = libs.shelbyGT.FrameGroupView;

  libs.shelbyGT.ContextOverlayView = FrameGroupView.extend({

    el: '#js-context-overlay-lining',

    events : _.extend({}, FrameGroupView.prototype.events, {
      "click .js-frame-locator" : "_frameLocator"
    }),

    options : _.extend({}, libs.shelbyGT.FrameGroupView.prototype.options, {
      contextOverlay : true
    }),

    initialize : function(data) {
      this.options.guide.bind('change:activeFrameModel', this._onActiveFrameModelChange, this);
    },

    _cleanup : function(){
      this.options.guide.unbind('change:activeFrameModel', this._onActiveFrameModelChange, this);
    },

    _onActiveFrameModelChange : function(guideModel, activeFrameModel){
      //unbind
      if (this.model) {
        this.model.unbind('destroy', this._onFrameRemove, this);
        this.model.unbind('change', this.render, this);
      }

      this.model = activeFrameModel;

      //THIS NEEDS TO BE GARBAGE COLLECTED
      this._conversationView = null;
      this._frameRollingView = null;
      this._frameSharingInGuideView = null;

      //bind
      this.model.bind('destroy', this._onFrameRemove, this);
      this.model.bind('change', this.render, this);

      this.render();
    },

    render : function() {
      this.$el.html( this.template({ frame: this.model, options: this.options }) );
    },

    template : function(obj) {
      return JST['frame'](obj);
    },

    _frameLocator : function(data){
      var origin = this.options.guide.get('activeFrameModel'),
          originHasRoll = origin.has('roll'),
          userDesires = shelby.models.userDesires,
          guideVisibility = userDesires.get('guideShown'),
          playingState = shelby.models.guide.get('playingState');

      if (!guideVisibility) {
        userDesires.set('guideShown', true);
      }

      if (playingState == libs.shelbyGT.PlayingState.dashboard || !originHasRoll) {
        //if video has no roll, or it's playingstate is 'dashboard', go to stream
        shelby.router.navigate('stream', {trigger:true});

      } else if( originHasRoll ) {
        //otherwise go to roll
        var frameId = origin.id,
            rollId = origin.get('roll').id;
        
        shelby.router.navigate('roll/' + rollId + '/frame/' + frameId, {trigger:true});
      }
    }

  });

} ) ();
