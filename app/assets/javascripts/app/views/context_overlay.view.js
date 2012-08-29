( function(){

  var FrameGroupView = libs.shelbyGT.FrameGroupView;

  libs.shelbyGT.ContextOverlayView = FrameGroupView.extend({

    el: '#js-context-overlay-lining',

    options : _.extend({}, libs.shelbyGT.FrameGroupView.prototype.options, {
      contextOverlay : true
    }),

    initialize : function(data) {
      this.options.guide.bind('change:activeFrameModel', this._onActiveFrameModelChange, this);
      shelby.models.queuedVideos.get('queued_videos').bind('add', this._onQueuedVideosAdd, this);
    },

    _cleanup : function(){
      this.options.guide.unbind('change:activeFrameModel', this._onActiveFrameModelChange, this);
      shelby.models.queuedVideos.get('queued_videos').unbind('add', this._onQueuedVideosAdd, this);
    },

    _onActiveFrameModelChange : function(guideModel, activeFrameModel){
      //unbind
      if (this.model) {
        this._setupTeardownModelBindings(this.model, false);
      }

      this.model = new libs.shelbyGT.FrameGroupModel();
      this.model.add(activeFrameModel)

      //bind
      this._setupTeardownModelBindings(this.model, true);

      this.render();
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
