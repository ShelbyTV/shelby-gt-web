libs.shelbyGT.GuideOverlayManagerView = Support.CompositeBehaviorView.extend({

  initialize : function() {
    this.model.bind('change', this._onGuideOverlayChange, this);
    this.model.bind('immediateHide', this._onGuideOverlayImmediateHide, this);
    this.$el.hide();
  },

  _cleanup : function(){
    this.model.unbind('change', this._onGuideOverlayChange, this);
    this.model.unbind('immediateHide', this._onGuideOverlayImmediateHide, this);
  },

  _onGuideOverlayChange : function(guideOverlayModel) {
    var guideOverlayView;
    
    //whether we're removing overlays or opening a new one, all
    //current overlays should be hidden
    this.children.each(function(child) {
      child.hide();
    });

    switch (guideOverlayModel.get('activeGuideOverlayType')) {
      case libs.shelbyGT.GuideOverlayType.none:
        return;
      case libs.shelbyGT.GuideOverlayType.conversation: guideOverlayView = new libs.shelbyGT.FrameConversationView({
            model : guideOverlayModel.get('activeGuideOverlayFrame'),
            guideOverlayModel : this.model
        });
        break;
      case libs.shelbyGT.GuideOverlayType.rolling:
        guideOverlayView = new libs.shelbyGT.FrameRollingView({
          model : guideOverlayModel.get('activeGuideOverlayFrame'),
          guideOverlayModel : this.model
        });
        break;
      case libs.shelbyGT.GuideOverlayType.share:
        var personalRoll = shelby.models.rollFollowings.getRollModelById(shelby.models.user.get('personal_roll').id);
        guideOverlayView = new libs.shelbyGT.FrameSharingInGuideView({
          model : guideOverlayModel.get('activeGuideOverlayFrame'),
          guideOverlayModel : this.model,
          roll : personalRoll
        });
        break;
    }

    guideOverlayView.render();
    this.appendChild(guideOverlayView);
    this.$el.show();
    setTimeout(function(){
      guideOverlayView.reveal();
    }, 0);
  },

  _onGuideOverlayImmediateHide : function() {
    this._leaveChildren();
    this.$el.hide();
    this.model.set({
        activeGuideOverlayType : libs.shelbyGT.GuideOverlayType.none,
        activeGuideOverlayFrame : null
    }, {silent:true});
  }

});
