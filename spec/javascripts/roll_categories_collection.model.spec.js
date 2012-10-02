describe("RollCategoriesCollectionModel", function() {
  
  describe("Instantiation", function() {
    it('should exhibit attributes', function() {
      var rollCategoryCollectionModel = new libs.shelbyGT.RollCategoriesCollectionModel({
        'attribute': 1
      });
      expect(rollCategoryCollectionModel.get('attribute')).toEqual(1);
    });
    it('should create relations', function() {
      this.rollCategoriesCollection = new Backbone.Collection();
      this.rollCategoriesCollectionStub =
        sinon.stub(libs.shelbyGT, 'RollCategoriesCollection').returns(this.rollCategoriesCollection);
      
      var rollCategoriesCollectionModel = new libs.shelbyGT.RollCategoriesCollectionModel();
      expect(this.rollCategoriesCollectionStub).toHaveBeenCalled();
      expect(rollCategoriesCollectionModel.get('roll_categories')).toBeDefined();
      expect(this.rollCategoriesCollection.model).toEqual(libs.shelbyGT.RollCategoryModel);

      this.rollCategoriesCollectionStub.restore();
    });
  });

  describe("Fetch", function() {
    beforeEach(function() {
      shelby.config = {
        apiRoot : ''
      };
      this.fixture = this.ajaxFixtures.RollCollections.valid;
      this.server = sinon.fakeServer.create();
      this.server.respondWith("GET", shelby.config.apiRoot + '/roll/featured', this.validResponse(this.fixture));
      this.rollCategories = new libs.shelbyGT.RollCategoriesCollectionModel();
      sinon.stub(Browser,'supportsCORS').returns(true);
    });
      
    afterEach(function() {
      this.server.restore();
      Browser.supportsCORS.restore();
    });

    it('should make the correct request', function() {
      this.rollCategories.fetch();
      expect(this.server.requests.length).toEqual(1);
      expect(this.server.requests[0].method).toEqual("GET");
      expect(this.server.requests[0].url).toEqual(shelby.config.apiRoot + '/roll/featured');
    });

    it('should parse the response', function() {
      this.rollCategories.fetch();
      this.server.respond();

      expect(this.rollCategories.get('roll_categories').length).toEqual(this.fixture.result.length);
    });
  });

});