libs.shelbyGT.GuideOverlayModel = Backbone.Model.extend({

  defaults : {
    activeGuideOverlayFrame : null,
    activeGuideOverlayType  : libs.shelbyGT.GuideOverlayType.none
  },

  clearAllGuideOverlays : function() {
    this.set({
      activeGuideOverlayFrame : null,
      activeGuideOverlayType : libs.shelbyGT.GuideOverlayType.none
    });
  },

  triggerImmediateHide : function() {
    this.trigger('immediateHide');
  }

});
