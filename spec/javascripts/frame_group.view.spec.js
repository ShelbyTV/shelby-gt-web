describe("FrameGroupView", function() {
  beforeEach(function() {
    shelby.models = {
      queuedVideos : new Backbone.Model({queued_videos:new Backbone.Collection()})
    };
    this.frameGroupModel = BackboneFactory.create('frame_group');
    this.guideOverlayModel = new libs.shelbyGT.GuideOverlayModel();
    this.view = new libs.shelbyGT.FrameGroupView({
      model : this.frameGroupModel,
      activationStateModel : new libs.shelbyGT.GuideModel(),
      guideOverlayModel : this.guideOverlayModel
    });
  });

  describe("Instantiation", function() {
    it("should create an <li> el", function() {
      expect(this.view.el.nodeName).toEqual("LI");
    });
  });

  xdescribe("Rendering", function() {

    beforeEach(function() {
        this.view.render();
    });

    it ("Should render its template correctly", function() {
      expect(this.view.$el).toContain('article');
    });

  });

  beforeEach(function() {
    sinon.stub(this.view, 'render', function() {
      this.$el.html('<div class="js-video-activity-toggle"></div>\
                    <div class="js-roll-frame"></div>\
                    <div class="js-share-frame"></div>');
      return this.el;
    });
    this.view.render();
  });
      
  afterEach(function() {
    this.view.render.restore();
  });

  describe("Events", function() {
    
    describe("Guide overlays", function() {
      beforeEach(function() {
        this.switchStub = sinon.stub(this.guideOverlayModel, 'switchOrHideOverlay');
      });
      
      afterEach(function() {
        this.switchStub.restore();
      });

      describe("click .js-video-activity-toggle", function() {
        it("should update guide overlay state using proper parameters to request conversation view", function() {
          expect(this.view.$el).toContain('.js-video-activity-toggle');
          this.view.$('.js-video-activity-toggle').click();
          expect(this.switchStub).toHaveBeenCalledWithExactly(libs.shelbyGT.GuideOverlayType.conversation, this.frameGroupModel.get('frames').at(0));
        });
      });

      describe("click .js-roll-frame", function() {
        it("should update guide overlay state using proper parameters to request rolling view", function() {
          expect(this.view.$el).toContain('.js-roll-frame');
          this.view.$('.js-roll-frame').click();
          expect(this.switchStub).toHaveBeenCalledWithExactly(libs.shelbyGT.GuideOverlayType.rolling, this.frameGroupModel.get('frames').at(0));
        });
      });

      describe("click .js-share-frame", function() {
        it("should update guide overlay state using proper parameters to request share view", function() {
          expect(this.view.$el).toContain('.js-share-frame');
          this.view.$('.js-share-frame').click();
          expect(this.switchStub).toHaveBeenCalledWithExactly(libs.shelbyGT.GuideOverlayType.share, this.frameGroupModel.get('frames').at(0));
        });
      });
    });
  });
});