describe("GuideOverlayView", function() {
  beforeEach(function() {
    this.guideOverlayModel = new libs.shelbyGT.GuideOverlayModel();
    this.view = new libs.shelbyGT.GuideOverlayView({guideOverlayModel:this.guideOverlayModel});
  });

  describe("Instantiation", function() {
    it("should create a <div> el", function() {
      expect(this.view.el.nodeName).toEqual("DIV");
    });

    it ("should have the class 'guide-overlay'", function() {
      expect(this.view.$el).toHaveClass('guide-overlay');
    });
  });

  describe("Methods", function() {

    describe("reveal", function() {
      it("should have class 'showing'", function() {
        this.view.reveal();
        expect(this.view.$el).toHaveClass('showing');
      });
    });

    describe("hide", function() {
      it("should NOT have class 'showing'", function() {
        this.view.reveal();
        this.view.hide();
        expect(this.view.$el).not.toHaveClass('showing');
      });
    });

    describe("_setGuideOverlayStateNone", function() {
      it("should have guide overlay state cleared", function() {
        this.view.options.guideOverlayModel.set({
          activeGuideOverlayType : 'something',
          activeGuideOverlayFrame : 'something else'
        });
        this.view._setGuideOverlayStateNone();
        expect(this.view.options.guideOverlayModel.get('activeGuideOverlayType')).toEqual(libs.shelbyGT.GuideOverlayType.none);
        expect(this.view.options.guideOverlayModel.get('activeGuideOverlayFrame')).toBeNull();
      });
    });

  });
});