describe("ShareFrameView", function() {
  beforeEach(function() {
    shelby = {};
    this.frame = BackboneFactory.create('frame');
    this.guideOverlayModel = new libs.shelbyGT.GuideOverlayModel();
    this.shareModel = new Backbone.Model({destination:['twitter']});
    this.view = new libs.shelbyGT.ShareFrameView({
      model : this.shareModel,
      guideOverlayModel : this.guideOverlayModel,
      frame: this.frame
    });
  });

  afterEach(function() {
    delete shelby;
  });

  describe("Instantiation", function() {
    it("should create a <div> el", function() {
      expect(this.view.el.nodeName).toEqual("DIV");
    });
  });

  describe("Methods", function() {

    describe("onShareSuccess", function() {
      it("should update guide overlay state to hide guide overlays", function() {
        shelby = {
          track : function(){},
          models : {
            user : new Backbone.Model()
          }
        };
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