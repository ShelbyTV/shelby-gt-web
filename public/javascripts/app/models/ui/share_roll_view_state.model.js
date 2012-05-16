libs.shelbyGT.ShareRollViewStateModel = Backbone.Model.extend({

  defaults: {
    visible: false,
    slide: true,
    shareSuccess: false
  },

  toggleVisibility : function() {
    this.set('slide', true);
    this.set('visible', !this.get('visible'));
  }

});
