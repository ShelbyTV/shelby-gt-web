describe("ExploreLayoutView", function() {
  beforeEach(function() {
    shelby = {
      models : {
        exploreGuide : new Backbone.Model()
      }
    };
    setFixtures('<div class="js-explore-layout"></div>');
    this.guideOverlayModel = new libs.shelbyGT.GuideOverlayModel();
    this.view = new libs.shelbyGT.ExploreLayoutView();
  });

  describe("Instantiation", function() {
    it("should attach to the element with class 'js-explore-layout'", function() {
      expect(this.view.$el).toHaveClass('js-explore-layout');
    });
  });
});