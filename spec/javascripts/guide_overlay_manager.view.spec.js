describe("GuideOverlayManagerView", function() {
  beforeEach(function() {
    setFixtures('<div class="main"></div>');
    this.guideOverlayModel = new libs.shelbyGT.GuideOverlayModel();
    this.view = new libs.shelbyGT.GuideOverlayManagerView({
      model : this.guideOverlayModel,
      el : '.main'
    });
  });

  describe("Instantiation", function() {
    it("should attach to the element with class 'main'", function() {
      expect(this.view.$el).toHaveClass('main');
    });
  });

  beforeEach(function() {
    this.frame = BackboneFactory.create('frame');
  });

  describe("Bindings", function() {
    beforeEach(function() {
      this.GuideOverlayViewStub = new (Backbone.View.extend({
          doPosition : function() {},
          reveal : function() {},
          hide : function() {}
      }))();
      sinon.spy(this.GuideOverlayViewStub, 'render');
      sinon.spy(this.GuideOverlayViewStub, 'doPosition');
      sinon.spy(this.GuideOverlayViewStub, 'reveal');
      this.hideSpy = sinon.spy(this.GuideOverlayViewStub, 'hide');

      this.user = BackboneFactory.create('user');
      this.rollFollowings = BackboneFactory.create('rollscollection');
      sinon.stub(this.rollFollowings, 'getRollModelById').returns(this.user.get('personalRoll'));
      
      shelby = {
        models : {
          rollFollowings : this.rollFollowings,
          user : this.user
        }
      };

      this.FrameConversationViewStub = sinon.stub(libs.shelbyGT, 'FrameConversationView').returns(this.GuideOverlayViewStub);
      this.FrameRollingViewStub = sinon.stub(libs.shelbyGT, 'FrameRollingView').returns(this.GuideOverlayViewStub);
      this.FrameSharingInGuideViewStub = sinon.stub(libs.shelbyGT, 'FrameSharingInGuideView').returns(this.GuideOverlayViewStub);
    });

    afterEach(function() {
      this.FrameConversationViewStub.restore();
      this.FrameRollingViewStub.restore();
      this.FrameSharingInGuideViewStub.restore();
    });

    it("should create, insert, and reveal correct overlay view when guide overlay model changes to conversation", function() {
      this.guideOverlayModel.set({
        activeGuideOverlayType : libs.shelbyGT.GuideOverlayType.conversation,
        activeGuideOverlayFrame : this.frame
      });
      expect(libs.shelbyGT.FrameConversationView).toHaveBeenCalledWithExactly({
          model : this.frame,
          guideOverlayModel : this.guideOverlayModel
        });
      expect(this.GuideOverlayViewStub.render).toHaveBeenCalled();
      expect(this.GuideOverlayViewStub.doPosition).toHaveBeenCalled();
      expect(this.GuideOverlayViewStub.reveal).toHaveBeenCalled();
      expect(this.view.$el).toContain(this.GuideOverlayViewStub.el);
    });
        
    it("should create, insert, and reveal correct overlay view when guide overlay model changes to rolling", function() {
      this.guideOverlayModel.set({
        activeGuideOverlayType : libs.shelbyGT.GuideOverlayType.rolling,
        activeGuideOverlayFrame : this.frame
      });
      expect(libs.shelbyGT.FrameRollingView).toHaveBeenCalledWithExactly({
        model : this.frame,
        guideOverlayModel : this.guideOverlayModel
      });
      expect(this.GuideOverlayViewStub.render).toHaveBeenCalled();
      expect(this.GuideOverlayViewStub.doPosition).toHaveBeenCalled();
      expect(this.GuideOverlayViewStub.reveal).toHaveBeenCalled();
      expect(this.view.$el).toContain(this.GuideOverlayViewStub.el);
    });

    it("should create, insert, and reveal correct overlay view when guide overlay model changes to share", function() {
      this.guideOverlayModel.set({
        activeGuideOverlayType : libs.shelbyGT.GuideOverlayType.share,
        activeGuideOverlayFrame : this.frame
      });
      expect(libs.shelbyGT.FrameSharingInGuideView).toHaveBeenCalledWithExactly({
        model:this.frame,
        guideOverlayModel : this.guideOverlayModel,
        roll : this.user.get('personalRoll')});
      expect(this.GuideOverlayViewStub.render).toHaveBeenCalled();
      expect(this.GuideOverlayViewStub.doPosition).toHaveBeenCalled();
      expect(this.GuideOverlayViewStub.reveal).toHaveBeenCalled();
      expect(this.view.$el).toContain(this.GuideOverlayViewStub.el);
    });

    it("should NOT create, insert, and reveal an overlay view when guide overlay model changes to none", function() {
      sinon.spy(this.view, 'appendChild');

      this.guideOverlayModel.set({
        activeGuideOverlayType : libs.shelbyGT.GuideOverlayType.none,
        activeGuideOverlayFrame : null
      });
      expect(this.GuideOverlayViewStub.render).not.toHaveBeenCalled();
      expect(this.GuideOverlayViewStub.doPosition).not.toHaveBeenCalled();
      expect(this.GuideOverlayViewStub.reveal).not.toHaveBeenCalled();
      expect(this.view.appendChild).not.toHaveBeenCalled();

      this.view.appendChild.restore();
    });

    it("should hide old guide overlays when new guide overlay is requested or guide overlay changes to none", function() {
      var childCount;

      childCount = this.view.children.value().length;
      this.guideOverlayModel.set({
        activeGuideOverlayType : libs.shelbyGT.GuideOverlayType.conversation,
        activeGuideOverlayFrame : this.frame
      });
      expect(this.hideSpy.callCount).toEqual(childCount);
      this.hideSpy.restore();
      this.hideSpy = sinon.spy(this.GuideOverlayViewStub, 'hide');
      
      childCount = this.view.children.value().length;
      this.guideOverlayModel.set({
        activeGuideOverlayType : libs.shelbyGT.GuideOverlayType.rolling,
        activeGuideOverlayFrame : this.frame
      });
      expect(this.hideSpy.callCount).toEqual(childCount);
      this.hideSpy.restore();
      this.hideSpy = sinon.spy(this.GuideOverlayViewStub, 'hide');

      childCount = this.view.children.value().length;
      this.guideOverlayModel.set({
        activeGuideOverlayType : libs.shelbyGT.GuideOverlayType.share,
        activeGuideOverlayFrame : this.frame
      });
      expect(this.hideSpy.callCount).toEqual(childCount);
      this.hideSpy.restore();
      this.hideSpy = sinon.spy(this.GuideOverlayViewStub, 'hide');

      childCount = this.view.children.value().length;
      this.guideOverlayModel.set({
        activeGuideOverlayType : libs.shelbyGT.GuideOverlayType.none,
        activeGuideOverlayFrame : null
      });
      expect(this.hideSpy.callCount).toEqual(childCount);
    });
  });
});