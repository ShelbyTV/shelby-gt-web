describe("RollCategoriesCollection", function() {
  
  describe("Instantiation", function() {
    beforeEach(function() {
      this.rollCategoryModelStub = sinon.stub(libs.shelbyGT, "RollCategoryModel");
      this.model = new Backbone.Model({
        id : 1,
        category : 'Sports',
        rolls : []
      });
      this.rollCategoryModelStub.returns(this.model);
      this.rollCategories = new libs.shelbyGT.RollCategoriesCollection();
      this.rollCategories.model = this.rollCategoryModelStub;
      this.rollCategories.add({
        id : 1,
        category : 'Sports',
        rolls : []
      });
    });
      
    afterEach(function() {
      this.rollCategoryModelStub.restore();
    });

    it('should add models', function() {
      expect(this.rollCategories.length).toEqual(1);
    });

    it('should find a model by id', function() {
      expect(this.rollCategories.get(1).get("category")).toEqual('Sports');
    });
  });

});