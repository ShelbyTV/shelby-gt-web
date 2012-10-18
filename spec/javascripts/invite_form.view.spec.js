describe("InviteFormView", function() {
  beforeEach(function() {
    setFixtures('<div class="js-invite-section-lining"></div>');
    this.view = new libs.shelbyGT.InviteFormView({
      el : '.js-invite-section-lining'
    });
  });

  describe("Instantiation", function() {
    it("should attach to the element with class 'js-invite-section-lining'", function() {
      expect(this.view.$el).toHaveClass('js-invite-section-lining');
    });
  });

  describe("Rendering", function() {

    beforeEach(function() {
        this.view.render();
    });

    it ("Should render its template correctly", function() {
      expect(this.view.$el).toContain('form.form_module.invite-form');
    });

  });
});