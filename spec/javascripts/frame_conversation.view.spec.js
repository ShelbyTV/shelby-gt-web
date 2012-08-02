describe("FrameConversationView", function() {
  beforeEach(function() {
    this.frame = BackboneFactory.create('frame');
    this.guideOverlayModel = new libs.shelbyGT.GuideOverlayModel();
    this.view = new libs.shelbyGT.FrameConversationView({
      model : this.frame,
      guideOverlayModel : this.guideOverlayModel
    });
  });

  describe("Instantiation", function() {
    it("should create a <div> el", function() {
      expect(this.view.el.nodeName).toEqual("DIV");
    });

    it("should have the classes 'conversation-overlay guide-overlay'", function() {
      expect(this.view.$el).toHaveClass("conversation-overlay");
      expect(this.view.$el).toHaveClass('guide-overlay');
    });
  });

  beforeEach(function() {
    sinon.stub(this.view, 'template').returns('<div class="back"></div>');
    this.view.render();
  });

  afterEach(function() {
    this.view.template.restore();
  });

  describe("Events", function() {

    describe("click .back:not(.js-busy)", function() {
      it("should update guide overlay state to hide guide overlays", function() {
        this.view.options.guideOverlayModel.set({
          activeGuideOverlayType : 'something',
          activeGuideOverlayFrame : 'something else'
        });
        this.view.$('.back').click();
        expect(this.view.options.guideOverlayModel.get('activeGuideOverlayType')).toEqual(libs.shelbyGT.GuideOverlayType.none);
        expect(this.view.options.guideOverlayModel.get('activeGuideOverlayFrame')).toBeNull();
      });
    });
  });
});