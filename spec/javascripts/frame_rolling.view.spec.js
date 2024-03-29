describe("FrameRollingView", function() {
  beforeEach(function() {
    this.frame = BackboneFactory.create('frame');
    this.guideOverlayModel = new libs.shelbyGT.GuideOverlayModel();
    this.shareActionStateModel = new Backbone.Model({doShare:libs.shelbyGT.ShareActionState.none});
    this.shareActionStateModelStub = sinon.stub(libs.shelbyGT, 'ShareActionStateModel');
    this.shareActionStateModelStub.returns(this.shareActionStateModel);
    shelby.models = {
      user : BackboneFactory.create('user')
    };
    this.view = new libs.shelbyGT.FrameRollingView({
      model : this.frame,
      guideOverlayModel : this.guideOverlayModel
    });
  });

  afterEach(function() {
    this.shareActionStateModelStub.restore();
  });

  describe("Instantiation", function() {
    it("should create a <div> el", function() {
      expect(this.view.el.nodeName).toEqual("DIV");
    });

    it("should have the classes 'guide-overlay__rolling-frame js-rolling-frame guide-overlay'", function() {
      expect(this.view.$el).toHaveClass("guide-overlay__rolling-frame");
      expect(this.view.$el).toHaveClass("js-rolling-frame");
      expect(this.view.$el).toHaveClass("guide-overlay");
    });
  });

  describe("Bindings", function() {
    beforeEach(function() {
      sinon.spy(this.view,'_setGuideOverlayStateNone');
    });

    afterEach(function() {
      this.view._setGuideOverlayStateNone.restore();
    });

    it("should update guide overlay model to request hiding guide overlay views when done is called", function() {
			sinon.stub(this.view,'_renderRollSelectionChild'); //don't need this actually be run
			this.view.done();
      expect(this.view._setGuideOverlayStateNone).toHaveBeenCalled();
    });
  });
});