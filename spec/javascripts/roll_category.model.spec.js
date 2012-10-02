describe("RollCategoryModel", function() {
  
  describe("Instantiation", function() {
    it('should exhibit attributes', function() {
      var rollCategory = new libs.shelbyGT.RollCategoryModel({
        category_title: 'Sports'
      });
      expect(rollCategory.get('category_title')).toEqual('Sports');
    });
    it('should have default attribute values', function() {
      var rollCategory = new libs.shelbyGT.RollCategoryModel();
      expect(rollCategory.get('category_title')).toBeNull();
    });
    
    beforeEach(function() {
      this.rollCollection = new Backbone.Collection();
      this.rollsCollectionStub = sinon.stub(libs.shelbyGT, 'RollsCollection').returns(this.rollCollection);
    });

    afterEach(function() {
      this.rollsCollectionStub.restore();
    });

    it('should create relations', function() {
      var rollCategory = new libs.shelbyGT.RollCategoryModel();
      expect(this.rollsCollectionStub).toHaveBeenCalled();
      expect(rollCategory.get('rolls')).toBeDefined();
      expect(this.rollCollection.model).toEqual(libs.shelbyGT.RollModel);
      expect(this.rollCollection.length).toEqual(0);

      this.rollsCollectionStub.restore();
    });
    it('should add models to the relations', function() {
      var rollCategory = new libs.shelbyGT.RollCategoryModel({
        rolls : [{id:'id'}]
      });
      expect(this.rollCollection.length).toEqual(1);
      expect(this.rollCollection.at(0).id).toEqual('id');
    });
  });

});