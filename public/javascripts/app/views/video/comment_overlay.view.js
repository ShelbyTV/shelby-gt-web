( function(){

  libs.shelbyGT.CommentOverlayView = Support.CompositeView.extend({

    events : {
    },

    className: 'comment-overlay',

    template : function(obj){
      return JST['comment-overlay'](obj);
    },

    initialize : function(){
      this.appended = false;
      this.model.bind('change:activeFrameModel', this._onActiveFrameModelChange, this);
    },
    
    render : function(frame){
      this.$el.html(this.template({frame:frame}));
      if (!this.appended) {
        $('#wrapper').append(this.$el);
        this.appended = true;
      }
    },

    _displayOverlay : function(){
      this.$el.show().fadeOut(2000);
    },

    _onActiveFrameModelChange : function(guide, newFrame){
      this.render(newFrame);
    }

  });

} ) ();
