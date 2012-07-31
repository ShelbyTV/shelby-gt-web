describe("Dynamic router", function() {
  describe("Route definitions", function() {
    beforeEach(function() {
        // can't stub Backbone router functions directly - here's the workaround:
        var dynamicRouter = new libs.shelbyGT.DynamicRouter();
        Backbone.history.stop();
        this.stubRouterProto = Backbone.Router.extend({routes:dynamicRouter.routes});
        // now the routing events will fire but the route handlers won't be called, so
        // we can test the route and parameter matching in isolation
    });

    afterEach(function() {
        // reset the url bar so a refresh will run the jasmine tests again
        this.router.navigate("");
    });

    describe("Route and parameter matching", function() {
      beforeEach(function() {
        this.router = new this.stubRouterProto();
        this.routeSpy = sinon.spy();
        try {
          Backbone.history.start({silent:true, pushState:true});
        } catch(e) {}
        this.router.navigate("elsewhere");
      });

      describe("/roll/ routes", function() {
        describe("roll/:rollId/frame/:frameId/comments", function() {
          it("fires the route with correct parameters", function() {
            this.router.bind("route:displayFrameInRollWithComments", this.routeSpy);
            this.router.navigate("roll/1/frame/2/comments", true);
            expect(this.routeSpy).toHaveBeenCalledOnce();
            expect(this.routeSpy).toHaveBeenCalledWithExactly('1', '2', undefined);
          });
        });

        describe("roll/:rollId/frame/:frameId", function() {
          it("fires the route with correct parameters", function() {
            this.router.bind("route:displayFrameInRoll", this.routeSpy);
            this.router.navigate("roll/3/frame/4", true);
            expect(this.routeSpy).toHaveBeenCalledOnce();
            expect(this.routeSpy).toHaveBeenCalledWithExactly('3', '4', undefined);
          });
        });
      });
    });
  });

  describe("Route handling", function() {
    // TODO: write handling tests for /comments route
  });
});