describe("InlineRollPromoView", function() {
  beforeEach(function() {
    this.model = new Backbone.Model({
      display_title: 'Some roll name',
      in_line_thumbnail_src: '/images/assets/matyus.png'
    });
    this.view = new libs.shelbyGT.InlineRollPromoView({
      model: this.model,
      promoAvatarSrc : this.model.get('in_line_thumbnail_src'),
      promoTitle: this.model.get('display_title')
    });
  });


  describe("Instantiation", function() {
    it("should create a <li> el", function() {
      expect(this.view.el.nodeName).toEqual("LI");
    });
  });

  describe("Rendering", function() {
  
    beforeEach(function() {
      shelby.track = sinon.spy();
    });

    it("renders the default promoMessage", function() {
      this.view.render();
      expect(this.view.$('.xuser-message')).toHaveText('Check out more great video on this roll');
    });

    it("renders the promoTitle", function() {
      this.view.render();
      expect(this.view.$('.xuser-data')).toHaveText('Some roll name');
    });

    it("renders the promoLinkSrc", function() {
      this.view.render();
      expect(this.view.$('.js-promo-link')).toHaveAttr('href', '#');
    });

    it("renders the promoAvatarSrc", function() {
      this.view.render();
      expect(this.view.$('.xuser-avatar img')).toHaveAttr('src', '/images/assets/matyus.png');
    });
  });
});