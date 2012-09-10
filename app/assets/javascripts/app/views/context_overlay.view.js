( function(){

  var FrameGroupView = libs.shelbyGT.FrameGroupView;

  libs.shelbyGT.ContextOverlayView = FrameGroupView.extend({

    el: '#js-context-overlay-lining',

    options : _.extend({}, libs.shelbyGT.FrameGroupView.prototype.options, {
      contextOverlay : true
    }),

    initialize : function(data) {
      this.options.contextOverlayState.bind('change:playingFrameGroup', this._onPlayingFrameGroupChange, this);
    },

    _cleanup : function(){
      this.options.contextOverlayState.unbind('change:playingFrameGroup', this._onPlayingFrameGroupChange, this);
      if (this.model) {
        this._setupTeardownModelBindings(this.model, false);
      }
    },

    _onPlayingFrameGroupChange : function(contestOverlayStateModel, playingFrameGroup){
      //unbind
      if (this.model) {
        this._setupTeardownModelBindings(this.model, false);
      }

      this.model = playingFrameGroup;

      //bind
      this._setupTeardownModelBindings(this.model, true);

      this.render();
    },

    _setupTeardownModelBindings : function(model, bind) {
      var action;
      if (bind) {
        action = 'bind';
      } else {
        action = 'unbind';
      }

      var groupFirstFrame = model.getFirstFrame();
      if (groupFirstFrame) {
        groupFirstFrame[action]('change', this.render, this);
        groupFirstFrame.get('conversation') && groupFirstFrame.get('conversation')[action]('change', this.render, this);
      }
      model[action]('change', this.render, this);
      shelby.models.queuedVideos[action]('add:queued_videos', this._onQueuedVideosAdd, this);
      shelby.models.queuedVideos[action]('remove:queued_videos', this._onQueuedVideosRemove, this);
    },

    render : function() {
      if (this.model) {
        this.$el.html(this.template({ queuedVideosModel : shelby.models.queuedVideos, frameGroup : this.model, frame : this.model.getFirstFrame(), options : this.options }));
      } else {
        this.$el.html('');
      }
    },

    template : function(obj) {
      return JST['frame'](obj);
    }

  });

} ) ();
