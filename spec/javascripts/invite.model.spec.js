describe("InviteModel", function() {
  
  describe("Instantiation", function() {
    it('should exhibit attributes', function() {
      var inviteModel = new libs.shelbyGT.InviteModel({
        'attribute': 1
      });
      expect(inviteModel.get('attribute')).toEqual(1);
    });

    it('should have correct default attributes', function() {
      var inviteModel = new libs.shelbyGT.InviteModel();
      expect(inviteModel.get('to')).toEqual('');
      expect(inviteModel.get('body')).toBeDefined();
    });
  });

  describe("Save", function() {
    beforeEach(function() {
      shelby.config = {
        apiRoot : ''
      };
      this.fixture = this.ajaxFixtures.Invite.valid;
      this.server = sinon.fakeServer.create();
      this.server.respondWith(shelby.config.apiRoot + '/beta_invite', this.validResponse(this.fixture));
      sinon.stub(Browser,'supportsCORS').returns(true);
      this.model = new libs.shelbyGT.InviteModel();
    });

    afterEach(function() {
      this.server.restore();
      Browser.supportsCORS.restore();
    });

    it('should make the correct request', function() {
      this.model.save();
      expect(this.server.requests.length).toEqual(1);
      expect(this.server.requests[0].method).toEqual("POST");
      expect(this.server.requests[0].url).toEqual(shelby.config.apiRoot + '/beta_invite');
    });

    it('should invoke the success callback', function() {
      var successSpy = sinon.spy();
      this.model.save(null, {success:successSpy});
      this.server.respond();
      expect(successSpy).toHaveBeenCalledOnce();
    });
  });

});