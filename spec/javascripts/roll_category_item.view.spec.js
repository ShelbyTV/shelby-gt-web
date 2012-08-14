describe("RollCategoryItemView", function() {
  beforeEach(function() {
    this.model = new Backbone.Model({
      category : 'Some Category Name'
    });
    this.view = new libs.shelbyGT.RollCategoryItemView({model:this.model});
  });

  describe("Instantiation", function() {
    it("should create a <li> el", function() {
      expect(this.view.el.nodeName).toEqual("LI");
    });

    it ("should have the classes 'list_item' and 'guide-item'", function() {
      expect(this.view.$el).toHaveClass('list_item');
      expect(this.view.$el).toHaveClass('guide-item');
    });
  });

  describe("Rendering", function() {
    it("returns the view object", function() {
      expect(this.view.render()).toEqual(this.view);
    });

    it("renders the category name", function() {
      this.view.render();
      expect(this.view.$('.list_button.guide-link')).toHaveText('Some Category Name');
    });
  });
});