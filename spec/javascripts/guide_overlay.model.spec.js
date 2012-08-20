describe("GuideOverlayModel", function() {
  
  describe("Instantiation", function() {
    it('should exhibit attributes', function() {
      var guideOverlayModel = new libs.shelbyGT.GuideOverlayModel({
        activeGuideOverlayType: libs.shelbyGT.GuideOverlayType.conversation
      });
      expect(guideOverlayModel.get('activeGuideOverlayType')).toEqual(libs.shelbyGT.GuideOverlayType.conversation);
    });
    it('should have default attribute values', function() {
      var guideOverlayModel = new libs.shelbyGT.GuideOverlayModel();
      expect(guideOverlayModel.get('activeGuideOverlayType')).toEqual(libs.shelbyGT.GuideOverlayType.none);
      expect(guideOverlayModel.get('activeGuideOverlayFrame')).toBeNull();
    });
  });


  describe("Methods", function() {
    beforeEach(function() {
      this.model = new libs.shelbyGT.GuideOverlayModel();
      this.frameModel = new Backbone.Model();
    });

    describe("switchOrHideOverlay", function() {
      it("should set guide overlay model state to reflect the arguments", function() {
        this.model.switchOrHideOverlay(libs.shelbyGT.GuideOverlayType.conversation, this.frameModel);
        expect(this.model.get('activeGuideOverlayType')).toEqual(libs.shelbyGT.GuideOverlayType.conversation);
        expect(this.model.get('activeGuideOverlayFrame')).not.toBeNull();
        expect(this.model.get('activeGuideOverlayFrame')).toEqual(this.frameModel);

        this.model.switchOrHideOverlay(libs.shelbyGT.GuideOverlayType.rolling, this.frameModel);
        expect(this.model.get('activeGuideOverlayType')).toEqual(libs.shelbyGT.GuideOverlayType.rolling);
        expect(this.model.get('activeGuideOverlayFrame')).not.toBeNull();
        expect(this.model.get('activeGuideOverlayFrame')).toEqual(this.frameModel);
      });
    
      it("should set guide overlay model state to reflect no guide overlay view if the specified view and frame are already displayed", function() {
        this.model.switchOrHideOverlay(libs.shelbyGT.GuideOverlayType.conversation, this.frameModel);
        this.model.switchOrHideOverlay(libs.shelbyGT.GuideOverlayType.conversation, this.frameModel);
        expect(this.model.get('activeGuideOverlayType')).toEqual(libs.shelbyGT.GuideOverlayType.none);
        expect(this.model.get('activeGuideOverlayFrame')).toBeNull();
      });

      it("should clear the overlay frame attribute if overlay type is set to none", function() {
        this.model.switchOrHideOverlay(libs.shelbyGT.GuideOverlayType.conversation, this.frameModel);
        this.model.switchOrHideOverlay(libs.shelbyGT.GuideOverlayType.none);
        expect(this.model.get('activeGuideOverlayType')).toEqual(libs.shelbyGT.GuideOverlayType.none);
        expect(this.model.get('activeGuideOverlayFrame')).toBeNull();
      });
    });
  });
});