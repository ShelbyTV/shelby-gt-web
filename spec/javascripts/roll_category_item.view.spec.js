describe("RollCategoryItemView", function() {
  beforeEach(function() {
    this.model = new Backbone.Model({
      category_title : 'Some Category Name'
    });
    this.superCtorStub = sinon.stub(libs.shelbyGT.ActiveHighlightListItemView.prototype, 'initialize');
    this.view = new libs.shelbyGT.RollCategoryItemView({model:this.model});
    this.superRenderStub =
      sinon.stub(libs.shelbyGT.ActiveHighlightListItemView.prototype, 'render').returns(this.view);
  });

  afterEach(function() {
    this.superCtorStub.restore();
    this.superRenderStub.restore();
  });

  describe("Instantiation", function() {
    it("should create a <li> el", function() {
      expect(this.view.el.nodeName).toEqual("LI");
    });

    it ("should have the classes 'list__item'", function() {
      expect(this.view.$el).toHaveClass('list__item');
    });

    it("should call the superclass initializer", function() {
      expect(this.superCtorStub).toHaveBeenCalled();
    });
  });

  describe("Rendering", function() {
    it("returns the view object", function() {
      expect(this.view.render()).toEqual(this.view);
    });

    it("renders the category name", function() {
      this.view.render();
      expect(this.view.$('.user')).toHaveText('Some Category Name');
    });
  });
});