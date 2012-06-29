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
        this.model.unbind('change', this.render, this);
        this.model.get('conversation').unbind('change', this._onConversationChange, this);
      }

      this.model = activeFrameModel;

      //THIS NEEDS TO BE GARBAGE COLLECTED
      this._conversationView = null;
      this._frameRollingView = null;
      this._frameSharingInGuideView = null;

      //bind
      this.model.bind('destroy', this._onFrameRemove, this);
      this.model.bind('change', this.render, this);
      this.model.get('conversation').bind('change', this._onConversationChange, this);

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
          guideVisibility = userDesires.get('guideShown');

      if (!guideVisibility) {
        userDesires.set('guideShown', true);
      }
        
      if (originHasRoll) {
          var frameId = origin.id,
              rollId = origin.get('roll').id;
          shelby.router.navigate('roll/' + rollId + '/frame/' + frameId, {trigger:true});
      }
    }

  });

} ) ();