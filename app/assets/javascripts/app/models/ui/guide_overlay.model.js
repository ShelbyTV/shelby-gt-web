libs.shelbyGT.GuideOverlayModel = Backbone.Model.extend({

  defaults : {
    activeGuideOverlayFrame : null,
    activeGuideOverlayType  : libs.shelbyGT.GuideOverlayType.none
  },

  switchOrHideOverlay : function(type, frameModel) {
    if (type == libs.shelbyGT.GuideOverlayType.none) {
      //if the type is none we don't care about the frameModel, just hide all overlays
      this.clearAllGuideOverlays();
      return;
    }

    //if we're already showing the specified overlay type for this frame, hide it
    var alreadyShowingThisOverlay =
        this.get('activeGuideOverlayType') == type &&
        this.has('activeGuideOverlayFrame') &&
        this.get('activeGuideOverlayFrame').id == frameModel.id;

    if (alreadyShowingThisOverlay) {
      // hide the current overlay(s)
      this.clearAllGuideOverlays();
    } else {
      // show the requested overlay
      this.set({
        'activeGuideOverlayFrame' : frameModel,
        'activeGuideOverlayType' : type
      });
    }
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
