describe("Frame Group View", function() {
  beforeEach(function() {
    this.frameGroupModel = BackboneFactory.create('frame_group');
    this.view = new libs.shelbyGT.FrameGroupView({
      model : this.frameGroupModel,
      activationStateModel : new libs.shelbyGT.GuideModel(),
      guideOverlayModel : new libs.shelbyGT.GuideOverlayModel()
    });
  });

  describe("Instantiation", function() {
    it("should create an <li> el", function() {
      expect(this.view.el.nodeName).toEqual("LI");
    });
    
    it("should create an el with class 'frame'", function() {
      expect($(this.view.el)).toHaveClass('frame');
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
    sinon.stub(this.view, 'template').returns('<div class="js-video-activity-toggle"></div>\
                                              <div class="js-roll-frame"></div>\
                                              <div class="js-share-frame"></div>');
    this.view.render();
  });
      
  afterEach(function() {
    this.view.template.restore();
  });

  describe("Events", function() {
    
    describe("Guide overlays", function() {
      beforeEach(function() {
        sinon.spy(this.view, '_checkSetGuideOverlayState');
      });
      
      afterEach(function() {
        this.view._checkSetGuideOverlayState.restore();
      });

      describe("click .js-video-activity-toggle", function() {
        it("should update guide overlay state using proper parameters to request conversation view", function() {
          expect(this.view.$el).toContain('.js-video-activity-toggle');
          this.view.$('.js-video-activity-toggle').click();
          expect(this.view._checkSetGuideOverlayState).toHaveBeenCalledWithExactly(libs.shelbyGT.GuideOverlayType.conversation);
        });
      });

      describe("click .js-roll-frame", function() {
        it("should update guide overlay state using proper parameters to request rolling view", function() {
          expect(this.view.$el).toContain('.js-roll-frame');
          this.view.$('.js-roll-frame').click();
          expect(this.view._checkSetGuideOverlayState).toHaveBeenCalledWithExactly(libs.shelbyGT.GuideOverlayType.rolling);
        });
      });

      describe("click .js-share-frame", function() {
        it("should update guide overlay state using proper parameters to request share view", function() {
          expect(this.view.$el).toContain('.js-share-frame');
          this.view.$('.js-share-frame').click();
          expect(this.view._checkSetGuideOverlayState).toHaveBeenCalledWithExactly(libs.shelbyGT.GuideOverlayType.share);
        });
      });
    });
  });

  describe("Methods", function() {

    describe("_checkSetGuideOverlayState", function() {
      it("should set guide overlay model state to reflect the parameters", function() {
        this.view._checkSetGuideOverlayState(libs.shelbyGT.GuideOverlayType.conversation);
        expect(this.view.options.guideOverlayModel.get('activeGuideOverlayType')).toEqual(libs.shelbyGT.GuideOverlayType.conversation);
        expect(this.view.options.guideOverlayModel.has('activeGuideOverlayFrame')).toBeTruthy();
        expect(this.view.options.guideOverlayModel.get('activeGuideOverlayFrame')).toEqual(this.frameGroupModel);
      });
    
      it("should set guide overlay model state to reflect no guide overlay view if the requested view and frame are already displayed", function() {
        this.view._checkSetGuideOverlayState(libs.shelbyGT.GuideOverlayType.conversation);
        this.view._checkSetGuideOverlayState(libs.shelbyGT.GuideOverlayType.conversation);
        expect(this.view.options.guideOverlayModel.get('activeGuideOverlayType')).toEqual(libs.shelbyGT.GuideOverlayType.none);
        expect(this.view.options.guideOverlayModel.get('activeGuideOverlayFrame')).toBeNull();
      });
    });
  });
});