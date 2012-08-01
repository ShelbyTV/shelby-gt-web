describe("FrameSharingInGuideView", function() {
  beforeEach(function() {
    this.frame = BackboneFactory.create('frame');
    this.view = new libs.shelbyGT.FrameSharingInGuideView({model:this.frame});
  });

  describe("Instantiation", function() {
    it("should create a <div> el", function() {
      expect(this.view.el.nodeName).toEqual("DIV");
    });

    it("should have the class 'frame-sharing'", function() {
      expect(this.view.$el).toHaveClass("frame-sharing");
    });
  });
});