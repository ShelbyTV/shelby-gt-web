describe("InviteFormView", function() {
  beforeEach(function() {
    shelby.config = {
      apiRoot : ''
    };
    setFixtures('<div class="js-invite-section"></div>');
    this.user = new Backbone.Model({
      name : 'Jan Novak'
    });
    this.model = new libs.shelbyGT.InviteModel({
      to: 'email@address.com',
      body : 'Here is some body text.'
    });
    this.view = new libs.shelbyGT.InviteFormView({
      el : '.js-invite-section',
      model : this.model,
      user : this.user
    });
  });

  describe("Instantiation", function() {
    it("should attach to the element with class 'js-invite-section'", function() {
      expect(this.view.$el).toHaveClass('js-invite-section');
    });
  });

  beforeEach(function() {
      this.view.render();
  });

  describe("Rendering", function() {

    it ("Should contain all the elements we need", function() {
      expect(this.view.$el).toContain('form.form_module.invite-form');
      expect(this.view.$el).toContain('textarea');
      expect(this.view.$el).toContain('.js-send-invite');
      expect(this.view.$el).toContain('.js-invite-email');
      expect(this.view.$el).toContain('.js-invite-subject');
      expect(this.view.$el).toContain('.js-invite-message');
    });

    it ("Should render the invite message from the model", function() {
      expect(this.view.$('textarea')).toHaveText(this.model.get('body'));
    });

    it ("Should render the inviting user's name in the message subject", function() {
      expect(this.view.$('.js-invite-subject').val()).toMatch(this.user.get('name'));
    });

    describe("When user has no name", function() {

      it ("Should render the inviting user's nickname in the message subject", function() {
        var userWithNoName = this.view.options.user = new Backbone.Model({nickname:'jan_w_novak'});
        this.view.render();
        expect(this.view.$('.js-invite-subject').val()).toMatch(userWithNoName.get('nickname'));
      });

    });

  });

  describe("Events", function() {

    beforeEach(function() {
      this.view.$('.js-invite-email').text("newemail@address.com");
    });

    describe("click .js-send-invite", function() {

      it("should send the invite", function() {
        var modelSaveStub = sinon.stub(this.model, 'save');
        this.view.$('.js-send-invite').click();
        expect(modelSaveStub).toHaveBeenCalledWith({
          to: this.view.$('.js-invite-email').text(),
          body: this.view.$('.js-invite-message').text()
        });
        modelSaveStub.restore();
      });

      beforeEach(function() {
        this.fixture = this.ajaxFixtures.Invite.valid;
        this.server = sinon.fakeServer.create();
        this.server.respondWith(shelby.config.apiRoot + '/beta_invite', this.validResponse(this.fixture));
        sinon.stub(Browser,'supportsCORS').returns(true);
        this.view.$('.js-send-invite').click();
      });

      afterEach(function() {
        this.server.restore();
        Browser.supportsCORS.restore();
      });

      describe("on success", function() {

        it("should hide the dialog", function() {
          expect(this.view.$el).toBeVisible();
          this.server.respond();
          expect(this.view.$el).not.toBeVisible();
        });

        it("should clear the email field", function() {
          expect(this.view.$('.js-invite-email')).toHaveText("newemail@address.com");
          this.server.respond();
          expect(this.view.$('.js-invite-email')).toHaveText("");
        });

      });
    });
  });
});