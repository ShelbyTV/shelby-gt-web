describe("InviteFormView", function() {
  beforeEach(function() {
    shelby.config = {
      apiRoot : ''
    };
    setFixtures('<div class="js-guide-invite"></div>');
    this.user = new Backbone.Model({
      name : 'Jan Novak'
    });
    this.model = new libs.shelbyGT.InviteModel({
      to: 'email@address.com',
      body : 'Here is some body text.'
    });
    this.view = new libs.shelbyGT.InviteFormView({
      el : '.js-guide-invite',
      model : this.model,
      user : this.user
    });
  });

  describe("Instantiation", function() {
    it("should attach to the element with class 'js-guide-invite'", function() {
      expect(this.view.$el).toHaveClass('js-guide-invite');
    });
  });

  describe("Rendering", function() {

    beforeEach(function() {
      this.view.render();
    });

    it ("Should contain all the elements we need", function() {
      expect(this.view.$el).toContain('.js-invite');
      expect(this.view.$el).toContain('form.form_module.invite-form');
      expect(this.view.$el).toContain('textarea');
      expect(this.view.$el).toContain('.js-send-invite');
      expect(this.view.$el).toContain('.js-invite-email');
      expect(this.view.$el).toContain('.js-invite-subject');
      expect(this.view.$el).toContain('.js-invite-message');
    });

    it ("Should render the invite message from the model", function() {
      expect(this.view.$('textarea')).toHaveText('Here is some body text.');
      expect(this.view.$('textarea')).toHaveValue('Here is some body text.');
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
      this.view.render();
      this.view.$('.js-invite-email').val("newemail@address.com");
    });

    describe("click .js-send-invite", function() {

      describe("Pre send and send actions", function() {

        beforeEach(function() {
          this.modelSaveStub = sinon.stub(this.model, 'save');
        });

        afterEach(function() {
          this.modelSaveStub.restore();
        });

        it("should send the invite", function() {
          this.view.$('.js-send-invite').click();
          expect(this.modelSaveStub).toHaveBeenCalledWith({
            to: "newemail@address.com",
            body: 'Here is some body text.'
          });
        });

        it("should send the invite with custom message", function() {
          this.view.$('.js-invite-message').val('The user typed this message.');
          this.view.$('.js-send-invite').click();
          expect(this.modelSaveStub).toHaveBeenCalledWith({
            to: "newemail@address.com",
            body: 'The user typed this message.'
          });
        });

        it("should add a class to keep the drop down open", function() {
          expect(this.view.$el).not.toHaveClass('dropdown_module--stay-open');
          this.view.$('.js-send-invite').click();
          expect(this.view.$el).toHaveClass('dropdown_module--stay-open');
        });

      });

      describe("on success", function() {

        beforeEach(function() {
          this.fixture = this.ajaxFixtures.Invite.valid;
          this.server = sinon.fakeServer.create();
          this.server.respondWith(shelby.config.apiRoot + '/beta_invite', this.validResponse(this.fixture));
          sinon.stub(Browser,'supportsCORS').returns(true);
          clock = sinon.useFakeTimers();
          this.view.$('.js-send-invite').click();
        });

        afterEach(function() {
          this.server.restore();
          Browser.supportsCORS.restore();
          clock.restore();
        });

        it("should replace invite form contents with success feedback", function() {
          this.server.respond();
          expect(this.view.$el).toContain('h3.invite-success');
        });

        describe("after timeout", function() {

          it("should remove the class that keeps the dialog open", function() {
            expect(this.view.$el).toHaveClass('dropdown_module--stay-open');
            this.server.respond();
            clock.tick(1500);
            expect(this.view.$el).not.toHaveClass('dropdown_module--stay-open');
          });

        });

      });
    });

    describe("mouseleave", function() {

      it("should re-render", function() {
        var renderSpy = sinon.spy(this.view, "render");
        this.view.$el.mouseleave();
        expect(renderSpy).toHaveBeenCalled();
        renderSpy.restore();
      });

    });
  });
});