( function(){

  var FrameView = libs.shelbyGT.FrameView;

  libs.shelbyGT.ContextOverlayView = FrameView.extend({

    el: '#js-context-overlay-lining',

    // events : {
    // },

    events : _.extend({}, FrameView.prototype.events, {
      "click .js-frame-locator" : "_frameLocator"
    }), 

    options : _.extend({}, libs.shelbyGT.FrameView.prototype.options, {
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
        this.model.unbind('change:upvoters', this._onUpvoteChange, this);
      }

      this.model = activeFrameModel;

      //THIS NEEDS TO BE GARBAGE COLLECTED
      this._conversationView = null;
      this._frameRollingView = null;
      this._frameSharingInGuideView = null;

      //bind
      this.model.bind('destroy', this._onFrameRemove, this);
      this.model.bind('change:upvoters', this._onUpvoteChange, this);

      this.render(guideModel, activeFrameModel);
    },

    render : function(guideModel, activeFrameModel) {
      this.$el.html( this.template({ frame: activeFrameModel, options: this.options }) );
    },

    template : function(obj) {
      return JST['frame'](obj);
    },

    _frameLocator : function(data){
      var origin = this.options.guide.get('activeFrameModel'),
          originHasRoll = origin.has('roll');
          // console.log(origin);

      //doesn't load anything newer than the one you asked for:
      //if user is watching the third video in a roll,
      //switches to a new roll,
      //then clicks "locate frame"
      //the guide will navigate successfully to the active frame
      //but will not load frames that have been added chronologically after the active frame

      if (originHasRoll) {
          var frameId = origin.id,
              rollId = origin.get('roll').id;
          shelby.router.navigate('roll/' + rollId + '/frame/' + frameId, {trigger:true});
      }
    }

  });

} ) ();