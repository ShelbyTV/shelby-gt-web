describe("FrameRollingView", function() {
  beforeEach(function() {
    this.frame = BackboneFactory.create('frame');
    this.guideOverlayModel = new libs.shelbyGT.GuideOverlayModel();
    this.ShareActionStateModelStub = sinon.stub(libs.shelbyGT, 'ShareActionStateModel').returns(new Backbone.Model());
    this.view = new libs.shelbyGT.FrameRollingView({
      model : this.frame,
      guideOverlayModel : this.guideOverlayModel
    });
  });

  afterEach(function() {
    this.ShareActionStateModelStub.restore();
  });

  describe("Instantiation", function() {
    it("should create a <div> el", function() {
      expect(this.view.el.nodeName).toEqual("DIV");
    });

    it("should have the classes 'js-rolling-frame rolling-frame'", function() {
      expect(this.view.$el).toHaveClass("js-rolling-frame");
      expect(this.view.$el).toHaveClass("rolling-frame");
    });
  });
});