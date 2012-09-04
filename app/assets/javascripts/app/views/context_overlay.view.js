( function(){

  var FrameGroupView = libs.shelbyGT.FrameGroupView;

  libs.shelbyGT.ContextOverlayView = FrameGroupView.extend({

    el: '#js-context-overlay-lining',

    options : _.extend({}, libs.shelbyGT.FrameGroupView.prototype.options, {
      contextOverlay : true
    }),

    initialize : function(data) {
      this.options.guide.bind('change:activeFrameModel', this._onActiveFrameModelChange, this);
    },

    _cleanup : function(){
      this.options.guide.unbind('change:activeFrameModel', this._onActiveFrameModelChange, this);
      if (this.model) {
        this._setupTeardownModelBindings(this.model, false);
      }
    },

    _onActiveFrameModelChange : function(guideModel, activeFrameModel){
      //unbind
      if (this.model) {
        this._setupTeardownModelBindings(this.model, false);
      }

      this.model = new libs.shelbyGT.FrameGroupModel();
      this.model.add(activeFrameModel);

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
      //TODO fix binding leak on frame group destoy - I'll still have bindings to the first frame
      //of the destroyed frame group
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
