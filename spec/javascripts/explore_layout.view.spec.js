describe("ExploreLayoutView", function() {
  beforeEach(function() {
    setFixtures('<div class="js-explore-layout"></div>');
    this.guideOverlayModel = new libs.shelbyGT.GuideOverlayModel();
    this.view = new libs.shelbyGT.ExploreLayoutView();
  });

  describe("Instantiation", function() {
    it("should attach to the element with class 'main'", function() {
      expect(this.view.$el).toHaveClass('js-explore-layout');
    });
  });
});