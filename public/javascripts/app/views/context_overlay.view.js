( function(){

  libs.shelbyGT.ContextOverlayView = Support.CompositeView.extend({

    el: '#js-context-overlay-lining',

    initialize : function(data) {
      console.log('init');
      this.model.bind('change:activeFrameModel', this._onActiveFrameModelChange, this);
    },

    render : function() {
      console.log('render');
      this.$el.html( this.template({ frame: this.model }) );
    },

    template : function(obj) {
      return JST['context-overlay'](obj);
    },

    _onActiveFrameModelChange : function(guideModel, activeFrameModel){
      this.render();
    }

  });

} ) ();