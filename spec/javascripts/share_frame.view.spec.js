describe("ShareFrameView", function() {
  beforeEach(function() {
    this.frame = BackboneFactory.create('frame');
    this.guideOverlayModel = new libs.shelbyGT.GuideOverlayModel();
    this.shareModel = new Backbone.Model();
    this.view = new libs.shelbyGT.ShareFrameView({
      model : this.shareModel,
      guideOverlayModel : this.guideOverlayModel
    });
  });

  describe("Instantiation", function() {
    it("should create a <div> el", function() {
      expect(this.view.el.nodeName).toEqual("DIV");
    });
  });

  describe("Methods", function() {

    describe("onShareSuccess", function() {
      it("should update guide overlay state to hide guide overlays", function() {
        this.guideOverlayModel.set({
          activeGuideOverlayType : 'something',
          activeGuideOverlayFrame : 'somethingelse'
        });
        this.view.onShareSuccess();
        expect(this.view.options.guideOverlayModel.get('activeGuideOverlayType')).toEqual(libs.shelbyGT.GuideOverlayType.none);
        expect(this.view.options.guideOverlayModel.get('activeGuideOverlayFrame')).toBeNull();
      });
    });
  });
});