describe("ExploreFrameItemView", function() {
  beforeEach(function() {
    shelby = {
      models : {
        queuedVideos : new Backbone.RelationalModel()
      }
    };
    this.frame = new Backbone.Model();
    this.view = new libs.shelbyGT.ExploreFrameItemView({model:this.frame});
  });

  describe("Instantiation", function() {
    it("should create a <li> el", function() {
      expect(this.view.el.nodeName).toEqual("LI");
    });

    it("should have the class 'explore-roll-item'", function() {
      expect(this.view.$el).toHaveClass('explore-roll-item');
    });
  });

});