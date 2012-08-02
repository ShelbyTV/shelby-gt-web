describe("DynamicRouter", function() {
  beforeEach(function() {
    shelby = {};
  });

  afterEach(function() {
    delete shelby;
  });

  describe("Route definitions", function() {
    beforeEach(function() {
        // can't stub Backbone router functions directly - here's the workaround:
        var dynamicRouter = new libs.shelbyGT.DynamicRouter();
        Backbone.history.stop();
        this.stubRouterProto = Backbone.Router.extend({routes:dynamicRouter.routes});
        // now the routing events will fire but the route handlers won't be called, so
        // we can test the route and parameter matching in isolation
    });

    describe("Route and parameter matching", function() {
      beforeEach(function() {
        this.router = new this.stubRouterProto();
        this.routeSpy = sinon.spy();
        try {
          Backbone.history.start({silent:true, pushState:true});
        } catch(e) {}
      });

      afterEach(function() {
        // reset the url bar so a refresh will run the jasmine tests again
        Backbone.history.stop();
      });

      describe("/roll/ routes", function() {
        describe("roll/:rollId/frame/:frameId/comments", function() {
          it("fires the route with correct parameters", function() {
            this.router.bind("route:displayFrameInRollWithComments", this.routeSpy);
            Backbone.history.loadUrl("roll/1/frame/2/comments", true);
            expect(this.routeSpy).toHaveBeenCalledOnce();
            expect(this.routeSpy).toHaveBeenCalledWithExactly('1', '2', undefined);
          });
        });

        describe("roll/:rollId/frame/:frameId", function() {
          it("fires the route with correct parameters", function() {
            this.router.bind("route:displayFrameInRoll", this.routeSpy);
            Backbone.history.loadUrl("roll/3/frame/4", true);
            expect(this.routeSpy).toHaveBeenCalledOnce();
            expect(this.routeSpy).toHaveBeenCalledWithExactly('3', '4', undefined);
          });
        });
      });
    });
  });

  describe("Route handling methods", function() {
    beforeEach(function() {
      this.router = new libs.shelbyGT.DynamicRouter();
    });

    describe("displayFrameInRollWithComments", function() {
      it("calls displayFrameInRoll with the option showCommentOverlay : true", function() {
        var callStub = sinon.stub(this.router, 'displayFrameInRoll');
        this.router.displayFrameInRollWithComments('1', '2', null);
        expect(callStub).toHaveBeenCalledWithExactly('1', '2', null, {showCommentOverlay:true});
        callStub.restore();
      });
    });

    describe("displayFrameInRoll", function() {
      it("passes showCommentOverlay input option through to _setupRollViewWithCallback", function() {
        shelby = {
          userSignedIn : function(){return true;}
        };
        var callStub = sinon.stub(this.router, '_setupRollViewWithCallback');
        this.router.displayFrameInRoll('1', '2', null, {showCommentOverlay:true}, null);
        expect(callStub).toHaveBeenCalledWithExactly('1', '2', {showCommentOverlay:true, rerollSuccess:null}, null);
        callStub.restore();
      });
    });

    describe("_setupRollViewWithCallback", function() {
      it("passes showCommentOverlay input option through to the callback", function() {
        var rollModel = new Backbone.Model();
        var callbackStub = sinon.stub(this.router, '_activateFrameInRollById');
        var callStub = sinon.stub(this.router, '_setupRollView').yieldsTo('onRollFetch', rollModel);
        this.router._setupRollViewWithCallback('1', '2', {showCommentOverlay:true}, null);
        expect(callbackStub).toHaveBeenCalledWithExactly(rollModel, '2', true);
        callbackStub.restore();
        callStub.restore();
      });
    });

    describe("_activateFrameInRollById", function() {
      it("activates the conversation overlay if showCommentOverlay is passed", function() {
        var frameId = '2';
        var frameModel = new Backbone.Model();
        var framesCollection = new Backbone.Collection();
        var rollModel = new Backbone.Model();
        shelby = {
          models : {
            guide : new Backbone.Model(),
            guideOverlay : new Backbone.Model()
          }
        };
        sinon.stub(rollModel, 'get').withArgs('frames').returns(framesCollection);
        sinon.stub(framesCollection, 'get').withArgs(frameId).returns(frameModel);
        this.router._activateFrameInRollById(rollModel, frameId, true);
        expect(shelby.models.guideOverlay.get('activeGuideOverlayType')).toEqual(libs.shelbyGT.GuideOverlayType.conversation);
        expect(shelby.models.guideOverlay.get('activeGuideOverlayFrame')).toEqual(frameModel);
      });
    });
  });
});